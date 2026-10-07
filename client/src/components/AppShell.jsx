import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #f7f3ea 0%, #fefefe 100%)" }}>
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar sx={{ backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(31,41,55,0.08)" }}>
          <Typography
            component={RouterLink}
            to="/"
            variant="h5"
            sx={{ color: "text.primary", textDecoration: "none", fontWeight: 800, letterSpacing: "0.04em" }}
          >
            AppCV
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1.5}>
            {!user && (
              <>
                <Button component={RouterLink} to="/login">Σύνδεση</Button>
                <Button variant="contained" component={RouterLink} to="/register">Εγγραφή</Button>
              </>
            )}
            {user && (
              <>
                <Typography sx={{ alignSelf: "center", color: "text.secondary" }}>
                  {user.fullname}
                </Typography>
                <Button onClick={logout}>Έξοδος</Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

