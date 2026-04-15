import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

export default function Admin({ api, authHeader }) {
  const [state, setState] = useState({ data: null, error: "" });

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const { data } = await api.get("/protected/admin", authHeader);
        setState({ data, error: "" });
      } catch (error) {
        setState({ data: null, error: error.response?.data?.message || "Admin data unavailable." });
      }
    };

    loadAdmin();
  }, [api, authHeader]);

  return (
    <Stack spacing={3}>
      {state.error ? <Alert severity="error">{state.error}</Alert> : null}
      <Card sx={{ boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            This area is available only for users with the admin role.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label="Role-based route guard enabled" color="primary" />
            <Chip label="API authorization enforced" color="secondary" />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Access Verification
              </Typography>
              <Typography color="text.secondary">
                {state.data?.message || "Waiting for protected admin response..."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seeded User Roles
              </Typography>
              <List dense>
                {state.data?.users?.map((user) => (
                  <ListItem key={user.email} disableGutters>
                    <ListItemText primary={user.name} secondary={`${user.email} • ${user.role}`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
