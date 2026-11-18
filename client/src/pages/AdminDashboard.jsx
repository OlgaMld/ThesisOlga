import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { api, getUploadUrl } from "../api/http";

export function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", public: 1 });
  const [selectedProvider, setSelectedProvider] = useState("mock");
  const [providerStatus, setProviderStatus] = useState({
    mock: true,
    openai: false,
    gemini: false,
    claude: false,
    mistral: false
  });
  const [isEvaluating, setIsEvaluating] = useState(false);

  const loadJobs = async () => {
    const data = await api.get("/jobs/mine");
    setJobs(data);
    if (!selectedJob && data[0]) {
      setSelectedJob(data[0]);
    }
  };

  const loadApplications = async (jobId) => {
    const data = await api.get(`/applications/job/${jobId}`);
    setApplications(data);
  };

  useEffect(() => {
    loadJobs().catch((err) => setError(err.message));

    api
      .get("/llm-status")
      .then(({ providers = [] }) => {
        const statusMap = providers.reduce((acc, provider) => {
          acc[provider.key] = Boolean(provider.enabled);
          return acc;
        }, {});

        setProviderStatus({
          mock: true,
          openai: Boolean(statusMap.openai),
          gemini: Boolean(statusMap.gemini),
          claude: Boolean(statusMap.claude),
          mistral: Boolean(statusMap.mistral)
        });
      })
      .catch(() => {
        setProviderStatus({ mock: true, openai: false, gemini: false, claude: false, mistral: false });
      });
  }, []);

  useEffect(() => {
    if (!selectedJob) {
      return;
    }

    loadApplications(selectedJob.id).catch((err) => setError(err.message));
  }, [selectedJob]);

  const createJob = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/jobs", form);
      setForm({ title: "", description: "", public: 1 });
      setMessage("Η αγγελία δημιουργήθηκε.");
      await loadJobs();
    } catch (err) {
      setError(err.message);
    }
  };

  const evaluate = async (job) => {
    setError("");
    setMessage("");
    setIsEvaluating(true);

    try {
      const result = await api.post(`/applications/job/${job.id}/evaluate`, {
        provider: selectedProvider
      });
      setSelectedJob(job);
      setApplications(result.applications);

      const apiErrorText = result.providerErrors?.[0]?.message;
      if (apiErrorText) {
        setError(`Το API ${selectedProvider.toUpperCase()} απέτυχε: ${apiErrorText}`);
        setMessage("Η αξιολόγηση ολοκληρώθηκε με fallback heuristic λόγω σφάλματος provider.");
      } else {
        setMessage(
          `Ολοκληρώθηκε αξιολόγηση για ${result.applications.length} αιτήσεις με ${selectedProvider.toUpperCase()}.`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const openCvPreview = (cvFile) => {
    const url = getUploadUrl(cvFile);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Stack spacing={4}>
      <Typography variant="h3">Πίνακας Διαχειριστή</Typography>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Stack component="form" spacing={2} onSubmit={createJob}>
          <Typography variant="h5">Νέα Αγγελία</Typography>
          <TextField
            label="Τίτλος"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="Περιγραφή"
            multiline
            minRows={6}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Button type="submit" variant="contained">
            Αποθήκευση Αγγελίας
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "420px minmax(0, 1fr)" },
          gap: 3,
          alignItems: "start"
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <Typography variant="h4">Οι Αγγελίες Μου</Typography>
            <TextField
              select
              label="Μηχανή AI"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              fullWidth
            >
              <MenuItem value="mock">Mock (λέξεις-κλειδιά)</MenuItem>
              <MenuItem value="openai" disabled={!providerStatus.openai}>
                OpenAI (GPT) {providerStatus.openai ? "" : "— δεν έχει κλειδί"}
              </MenuItem>
              <MenuItem value="gemini" disabled={!providerStatus.gemini}>
                Google Gemini {providerStatus.gemini ? "" : "— δεν έχει κλειδί"}
              </MenuItem>
              <MenuItem value="claude" disabled={!providerStatus.claude}>
                Anthropic Claude {providerStatus.claude ? "" : "— δεν έχει κλειδί"}
              </MenuItem>
              <MenuItem value="mistral" disabled={!providerStatus.mistral}>
                Mistral {providerStatus.mistral ? "" : "— δεν έχει κλειδί"}
              </MenuItem>
            </TextField>
            {!providerStatus[selectedProvider] && (
              <Alert severity="warning">
                Το {selectedProvider.toUpperCase()} δεν έχει διαμορφωμένο API key. Θα χρησιμοποιηθεί fallback heuristic.
              </Alert>
            )}
            {jobs.map((job) => (
              <Card
                key={job.id}
                sx={{
                  cursor: "pointer",
                  minWidth: 0,
                  border:
                    selectedJob?.id === job.id
                      ? "2px solid #bb5a04"
                      : "1px solid rgba(31,41,55,0.08)"
                }}
                onClick={() => setSelectedJob(job)}
              >
                <CardContent sx={{ minWidth: 0 }}>
                  <Typography variant="h5" sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {job.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Αιτήσεις: {job.applications}
                  </Typography>
                  <Button
                    sx={{ mt: 2 }}
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      evaluate(job);
                    }}
                    disabled={isEvaluating}
                    startIcon={isEvaluating ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    {isEvaluating ? "Γίνεται αξιολόγηση..." : "Έλεγχος / Scoring"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Paper sx={{ p: 3, minHeight: 420, minWidth: 0 }}>
            <Stack spacing={2}>
              <Typography variant="h4">
                {selectedJob ? `Αιτήσεις για: ${selectedJob.title}` : "Επίλεξε αγγελία"}
              </Typography>
              <Divider />
              {applications.length === 0 && (
                <Typography color="text.secondary">
                  Δεν υπάρχουν αιτήσεις ή δεν έχει τρέξει ακόμη αξιολόγηση.
                </Typography>
              )}
              {applications.map((item) => (
                <Box
                  key={`${item.id_cv}-${item.id_agg}`}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: "#faf7f0",
                    border: "1px solid rgba(31,41,55,0.08)"
                  }}
                >
                  <Typography variant="h6">{item.fullname}</Typography>
                  <Typography color="text.secondary">{item.email}</Typography>
                  <Typography sx={{ mt: 1 }}>
                    CV:{" "}
                    <Box
                      component="button"
                      type="button"
                      onClick={() => openCvPreview(item.cv_file)}
                      sx={{
                        p: 0,
                        border: 0,
                        background: "none",
                        color: "primary.main",
                        cursor: "pointer",
                        font: "inherit",
                        fontWeight: 700,
                        textDecoration: "underline"
                      }}
                    >
                      {item.cv_title}
                    </Box>
                  </Typography>
                  <Typography sx={{ mt: 1, fontWeight: 700 }}>
                    Score: {item.grade ?? "Δεν έχει αξιολογηθεί"}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {item.response || "Δεν υπάρχει ακόμη αιτιολόγηση."}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Stack>
  );
}
