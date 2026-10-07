import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function HomePage() {
  const { user } = useAuth();

  return (
    <Stack spacing={4}>
      <Box
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 6,
          background: "radial-gradient(circle at top left, #ffd9a8 0%, #fff4e2 35%, #ffffff 100%)",
          border: "1px solid rgba(194,122,44,0.18)"
        }}
      >
        <Stack spacing={2}>
          
          <Typography variant="h3">Σύστημα αξιολόγησης βιογραφικών για αγγελίες εργασίας</Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 760 }}>
            Οι διαχειριστές δημοσιεύουν αγγελίες, οι υποψήφιοι ανεβάζουν PDF βιογραφικά και κάνουν αιτήσεις,
            και το σύστημα επιστρέφει score καταλληλότητας ανά αίτηση.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {!user && (
              <>
                <Button size="large" variant="contained" component={RouterLink} to="/register">Εγγραφή Υποψηφίου</Button>
                <Button size="large" variant="outlined" component={RouterLink} to="/login">Σύνδεση</Button>
              </>
            )}
            {user?.role === "candidate" && (
              <Button size="large" variant="contained" component={RouterLink} to="/candidate">Μετάβαση Υποψηφίου</Button>
            )}
            {user?.role === "admin" && (
              <Button size="large" variant="contained" component={RouterLink} to="/admin">Μετάβαση Διαχειριστή</Button>
            )}
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <WorkOutlineRoundedIcon color="primary" />
              <Typography variant="h5" sx={{ mt: 1 }}>Αγγελίες</Typography>
              <Typography color="text.secondary">Οι διαχειριστές δημιουργούν και δημοσιεύουν θέσεις εργασίας.</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <DescriptionRoundedIcon color="primary" />
              <Typography variant="h5" sx={{ mt: 1 }}>Βιογραφικά</Typography>
              <Typography color="text.secondary">Οι υποψήφιοι ανεβάζουν PDF και τα χρησιμοποιούν στις αιτήσεις τους.</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <AdminPanelSettingsRoundedIcon color="primary" />
              <Typography variant="h5" sx={{ mt: 1 }}>AI Evaluation</Typography>
              <Typography color="text.secondary">Το LLM επιστρέφει score 0-100 και σύντομη αιτιολόγηση ανά αίτηση.</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    
    </Stack>
  );
}

