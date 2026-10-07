import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
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

    try {
      const result = await api.post(`/applications/job/${job.id}/evaluate`, {
        provider: selectedProvider
      });
      setSelectedJob(job);
      setApplications(result.applications);
      setMessage(
        `Ολοκληρώθηκε αξιολόγηση για ${result.applications.length} αιτήσεις με ${selectedProvider.toUpperCase()}.`
      );
    } catch (err) {
      setError(err.message);
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Typography variant="h4">Οι Αγγελίες Μου</Typography>
            <TextField
              select
              label="Μηχανή AI"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              fullWidth
            >
              <MenuItem value="mock">Mock (λέξεις-κλειδιά)-pol</MenuItem>
              <MenuItem value="openai">OpenAI (GPT)</MenuItem>
              <MenuItem value="gemini">Google Gemini</MenuItem>
            </TextField>
            {jobs.map((job) => (
              <Card
                key={job.id}
                sx={{
                  cursor: "pointer",
                  border:
                    selectedJob?.id === job.id
                      ? "2px solid #bb5a04"
                      : "1px solid rgba(31,41,55,0.08)"
                }}
                onClick={() => setSelectedJob(job)}
              >
                <CardContent>
                  <Typography variant="h5">{job.title}</Typography>
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
                  >
                    Έλεγχος / Scoring
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, minHeight: 420 }}>
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
        </Grid>
      </Grid>
    </Stack>
  );
}
