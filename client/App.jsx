import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

const tokenKey = "amazonia_token";
const userKey = "amazonia_user";

const theme = createTheme({
  palette: {
    primary: {
      main: "#c05d00",
    },
    secondary: {
      main: "#173f5f",
    },
    background: {
      default: "#eef3fb",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
    h4: {
      fontWeight: 800,
    },
  },
});

function AuthenticatedShell({ auth, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Dashboard", path: "/dashboard", roles: ["user", "admin"] },
    { label: "Admin", path: "/admin", roles: ["admin"] },
  ].filter((link) => link.roles.includes(auth.user?.role));

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(16, 37, 66, 0.08)",
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton color="inherit" onClick={() => setOpen(true)} sx={{ display: { md: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: "secondary.main" }}>
              <SecurityRoundedIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Amazonia Auth Suite</Typography>
              <Typography variant="body2" color="text.secondary">
                Login validation, protected routes, and RBAC in one app
              </Typography>
            </Box>
          </Stack>
          <Chip
            color={auth.user?.role === "admin" ? "primary" : "secondary"}
            icon={<VerifiedUserRoundedIcon />}
            label={`${auth.user?.name || "User"} (${auth.user?.role || "guest"})`}
          />
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<LogoutRoundedIcon />}
            onClick={() => {
              onLogout();
              navigate("/login", { replace: true });
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Navigation
          </Typography>
          <List>
            {links.map((link) => (
              <ListItemButton
                key={link.path}
                selected={location.pathname === link.path}
                onClick={() => {
                  navigate(link.path);
                  setOpen(false);
                }}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
          {links.map((link) => (
            <Button
              key={link.path}
              variant={location.pathname === link.path ? "contained" : "outlined"}
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </Button>
          ))}
        </Stack>
        {children}
      </Container>
    </Box>
  );
}

function AppRoutes() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem(tokenKey);
    const user = localStorage.getItem(userKey);
    return {
      token,
      user: user ? JSON.parse(user) : null,
      loading: Boolean(token),
      message: "",
    };
  });

  const authHeader = useMemo(
    () => ({
      headers: {
        Authorization: auth.token ? `Bearer ${auth.token}` : "",
      },
    }),
    [auth.token]
  );

  const clearAuth = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setAuth({ token: null, user: null, loading: false, message: "" });
  };

  useEffect(() => {
    const syncProfile = async () => {
      if (!auth.token) {
        setAuth((current) => ({ ...current, loading: false }));
        return;
      }

      try {
        const { data } = await api.get("/auth/me", authHeader);
        localStorage.setItem(userKey, JSON.stringify(data.user));
        setAuth((current) => ({
          ...current,
          user: data.user,
          loading: false,
        }));
      } catch (error) {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        setAuth({
          token: null,
          user: null,
          loading: false,
          message: error.response?.data?.message || "Session expired. Please log in again.",
        });
      }
    };

    syncProfile();
  }, [auth.token, authHeader]);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(userKey, JSON.stringify(data.user));
    setAuth({
      token: data.token,
      user: data.user,
      loading: false,
      message: data.message,
    });
    return data;
  };

  if (auth.loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography color="text.secondary">Verifying your session...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography color="text.secondary">Loading module...</Typography>
          </Stack>
        </Box>
      }
    >
      <Routes>
        <Route
          path="/login"
          element={
            auth.token ? <Navigate to="/dashboard" replace /> : <Login login={login} sessionMessage={auth.message} />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute token={auth.token}>
              <AuthenticatedShell auth={auth} onLogout={clearAuth}>
                <Dashboard api={api} authHeader={authHeader} user={auth.user} />
              </AuthenticatedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute token={auth.token}>
              <RoleRoute user={auth.user} allowedRoles={["admin"]}>
                <AuthenticatedShell auth={auth} onLogout={clearAuth}>
                  <Admin api={api} authHeader={authHeader} />
                </AuthenticatedShell>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={auth.token ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
