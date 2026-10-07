import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { api, getUploadUrl } from "../api/http";

export function CandidateDashboard() {
  const [jobs, setJobs] = useState([]);
  const [cvs, setCvs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadData, setUploadData] = useState({ title: "", public: 1, file: null });
  const [selectedCv, setSelectedCv] = useState("");

  const loadData = async () => {
    const [jobsData, cvsData, applicationsData] = await Promise.all([
      api.get("/jobs"),
      api.get("/cvs/mine"),
      api.get("/applications/mine")
    ]);

    setJobs(jobsData);
    setCvs(cvsData);
    setApplications(applicationsData);

    if (!selectedCv && cvsData[0]) {
      setSelectedCv(String(cvsData[0].id));
    }
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, []);

  const uploadCv = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("title", uploadData.title);
    formData.append("public", uploadData.public);
    formData.append("cv", uploadData.file);

    try {
      await api.post("/cvs/upload", formData);
      setMessage("Το βιογραφικό ανέβηκε επιτυχώς.");
      setUploadData({ title: "", public: 1, file: null });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const apply = async (jobId) => {
    setError("");
    setMessage("");

    try {
      await api.post("/applications", { jobId, cvId: Number(selectedCv) });
      setMessage("Η αίτηση υποβλήθηκε.");
      await loadData();
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
      <Typography variant="h3">Πίνακας Υποψηφίου</Typography>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Stack component="form" spacing={2} onSubmit={uploadCv}>
          <Typography variant="h5">Ανέβασμα Βιογραφικού PDF</Typography>
          <TextField
            label="Τίτλος βιογραφικού"
            value={uploadData.title}
            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
          />
          <TextField
            select
            label="Ορατότητα"
            value={uploadData.public}
            onChange={(e) => setUploadData({ ...uploadData, public: e.target.value })}
          >
            <MenuItem value={1}>Δημόσιο</MenuItem>
            <MenuItem value={0}>Ιδιωτικό</MenuItem>
          </TextField>
          <Button variant="outlined" component="label">
            Επιλογή PDF
            <input
              hidden
              type="file"
              accept="application/pdf"
              onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
            />
          </Button>
          <Typography color="text.secondary">
            {uploadData.file?.name || "Δεν έχει επιλεγεί αρχείο."}
          </Typography>
          <Button type="submit" variant="contained" disabled={!uploadData.file || !uploadData.title}>
            Αποθήκευση
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Τα Βιογραφικά Μου</Typography>
          {cvs.length === 0 && (
            <Typography color="text.secondary">Δεν υπάρχουν ακόμη βιογραφικά.</Typography>
          )}
          {cvs.length > 0 && (
            <>
              <TextField
                select
                label="Βιογραφικό για αίτηση"
                value={selectedCv}
                onChange={(e) => setSelectedCv(e.target.value)}
              >
                {cvs.map((cv) => (
                  <MenuItem key={cv.id} value={String(cv.id)}>
                    {cv.title}
                  </MenuItem>
                ))}
              </TextField>
              <Stack spacing={1.5}>
                {cvs.map((cv) => (
                  <Paper
                    key={cv.id}
                    variant="outlined"
                    sx={{ p: 2, display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{cv.title}</Typography>
                      <Typography color="text.secondary">
                        Ανέβηκε: {new Date(cv.date_upload).toLocaleString("el-GR")}
                      </Typography>
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => openCvPreview(cv.cv_file)}
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
                      Προβολή PDF
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Paper>

      <Stack spacing={2}>
        <Typography variant="h4">Διαθέσιμες Αγγελίες</Typography>
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} md={6} key={job.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Typography variant="h5">{job.title}</Typography>
                    <Chip label={job.admin_name} />
                  </Stack>
                  <Typography color="text.secondary" sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
                    {job.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" onClick={() => apply(job.id)} disabled={!selectedCv}>
                    Κάνε Αίτηση
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h4">Οι Αιτήσεις Μου</Typography>
        {applications.length === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography color="text.secondary">Δεν έχεις κάνει ακόμη αιτήσεις.</Typography>
          </Paper>
        )}
        <Grid container spacing={3}>
          {applications.map((application) => (
            <Grid item xs={12} md={6} key={`${application.id_cv}-${application.id_agg}`}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Typography variant="h5">{application.job_title}</Typography>
                      <Chip
                        color={application.grade >= 70 ? "success" : application.grade >= 40 ? "warning" : "default"}
                        label={application.grade != null ? `Score: ${application.grade}` : "Σε αναμονή"}
                      />
                    </Stack>
                    <Typography color="text.secondary">Διαχειριστής: {application.admin_name}</Typography>
                    <Typography color="text.secondary">
                      Βιογραφικό:{" "}
                      <Box
                        component="button"
                        type="button"
                        onClick={() => openCvPreview(application.cv_file)}
                        sx={{
                          p: 0,
                          border: 0,
                          background: "none",
                          color: "primary.main",
                          cursor: "pointer",
                          font: "inherit",
                          textDecoration: "underline"
                        }}
                      >
                        {application.cv_title}
                      </Box>
                    </Typography>
                    <Typography color="text.secondary">
                      Ημερομηνία αίτησης: {new Date(application.date).toLocaleString("el-GR")}
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#faf7f0" }}>
                      <Typography variant="subtitle2">Αιτιολόγηση αξιολόγησης</Typography>
                      <Typography color="text.secondary">
                        {application.response || "Δεν έχει γίνει ακόμη αξιολόγηση για αυτή την αίτηση."}
                      </Typography>
                    </Paper>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
}
