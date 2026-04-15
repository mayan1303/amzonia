import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

const demoCredentials = [
  { role: "Admin", email: "admin@amazonia.com", password: "Admin@123" },
  { role: "User", email: "user@amazonia.com", password: "User@1234" },
];

function getLoginErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ERR_NETWORK") {
    return "Cannot reach the backend. Check Vercel API URL and Render CLIENT_URLS.";
  }

  if (error.message) {
    return error.message;
  }

  return "Unable to sign in right now. Please try again.";
}

export default function Login({ login, sessionMessage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitState, setSubmitState] = useState({ loading: false, error: "", success: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setSubmitState({ loading: true, error: "", success: "" });
    try {
      const response = await login(values);
      setSubmitState({
        loading: false,
        error: "",
        success: `${response.user.name} signed in successfully.`,
      });
      const destination = location.state?.from || "/dashboard";
      setTimeout(() => navigate(destination, { replace: true }), 700);
    } catch (error) {
      setSubmitState({
        loading: false,
        error: getLoginErrorMessage(error),
        success: "",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
      }}
    >
      <Grid container maxWidth="lg" sx={{ bgcolor: "rgba(255,255,255,0.78)", borderRadius: 6, overflow: "hidden", boxShadow: 8 }}>
        <Grid
          size={{ xs: 12, md: 5 }}
          sx={{
            p: { xs: 4, md: 5 },
            background:
              "linear-gradient(160deg, rgba(23,63,95,0.96) 0%, rgba(9,33,51,0.98) 100%)",
            color: "#fff6e9",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: "0.3em", color: "#ffcb80" }}>
              Experiment Suite
            </Typography>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Secure React Login and Access Control
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 420, color: "rgba(255,246,233,0.78)" }}>
              This single app combines validated login, JWT-protected routes, and role-based access control with responsive Material UI screens.
            </Typography>
          </Box>
          <Stack spacing={1.5}>
            {demoCredentials.map((demo) => (
              <Card key={demo.role} sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "inherit" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {demo.role} Demo
                  </Typography>
                  <Typography variant="body2">{demo.email}</Typography>
                  <Typography variant="body2">{demo.password}</Typography>
                  <Link
                    component="button"
                    underline="hover"
                    color="#ffcb80"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      setValue("email", demo.email);
                      setValue("password", demo.password);
                    }}
                  >
                    Fill these credentials
                  </Link>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }} sx={{ p: { xs: 3, md: 5 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Sign in
              </Typography>
              <Typography color="text.secondary">
                Controlled inputs, client-side validation, loading feedback, and alert-based authentication status.
              </Typography>
            </Box>

            {sessionMessage ? <Alert severity="warning">{sessionMessage}</Alert> : null}
            {submitState.error ? <Alert severity="error">{submitState.error}</Alert> : null}
            {submitState.success ? <Alert severity="success">{submitState.success}</Alert> : null}

            <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                label="Email address"
                fullWidth
                autoComplete="email"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address.",
                  },
                })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                autoComplete="current-password"
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 8,
                    message: "Password must contain at least 8 characters.",
                  },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                    message: "Use upper, lower, number, and special character.",
                  },
                })}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitState.loading}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {submitState.loading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={22} color="inherit" />
                    <span>Authenticating...</span>
                  </Stack>
                ) : (
                  "Login"
                )}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
