import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

export default function Dashboard({ api, authHeader, user }) {
  const [state, setState] = useState({ data: null, error: "" });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get("/protected/dashboard", authHeader);
        setState({ data, error: "" });
      } catch (error) {
        setState({ data: null, error: error.response?.data?.message || "Failed to load dashboard." });
      }
    };

    loadDashboard();
  }, [api, authHeader]);

  return (
    <Stack spacing={3}>
      {state.error ? <Alert severity="error">{state.error}</Alert> : null}
      <Card sx={{ boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            This page demonstrates JWT-protected access after login.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Role: ${user?.role}`} color="primary" />
            <Chip label={`Email: ${user?.email}`} color="secondary" />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Protected Route Result
              </Typography>
              <Typography color="text.secondary">
                {state.data?.message || "Waiting for server response..."}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense>
                {state.data?.checklist?.map((item) => (
                  <ListItem key={item} disableGutters>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Experiment Coverage
              </Typography>
              <List dense>
                <ListItem disableGutters>
                  <ListItemText primary="Experiment 3.1.1" secondary="React Hook Form validation, responsive UI, loading spinner, and alerts." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Experiment 3.1.2" secondary="JWT stored in localStorage and verified on protected API calls." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Experiment 3.1.3" secondary="Admin-only route and role-filtered navigation menu." />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
