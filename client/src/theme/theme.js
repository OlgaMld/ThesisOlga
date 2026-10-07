import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#bb5a04"
    },
    secondary: {
      main: "#205c4f"
    },
    background: {
      default: "#fffaf4",
      paper: "#ffffff"
    }
  },
  shape: {
    borderRadius: 18
  },
  typography: {
    fontFamily: '"Segoe UI", "Tahoma", sans-serif',
    h2: {
      fontSize: "clamp(2.4rem, 5vw, 4rem)",
      fontWeight: 800,
      lineHeight: 1
    },
    h3: {
      fontWeight: 800
    },
    h4: {
      fontWeight: 700
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 700,
          paddingInline: 20
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 24px 60px rgba(90, 52, 14, 0.08)"
        }
      }
    }
  }
});

