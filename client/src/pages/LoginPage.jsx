import { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "candidate" });

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate(form.role === "admin" ? "/admin" : "/candidate");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 480 }}>
        <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
          <Typography variant="h4">Σύνδεση</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            label="Ρόλος"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <MenuItem value="candidate">Υποψήφιος</MenuItem>
            <MenuItem value="admin">Διαχειριστής</MenuItem>
          </TextField>
          <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField 
            label="Κωδικός" 
            type={showPassword ? "text" : "password"}
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button type="submit" variant="contained" size="large">Είσοδος</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

