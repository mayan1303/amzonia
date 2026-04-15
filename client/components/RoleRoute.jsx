import { Alert, Box } from "@mui/material";
import { Navigate } from "react-router-dom";

export default function RoleRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You are logged in, but your role does not allow access to this page.
        </Alert>
      </Box>
    );
  }

  return children;
}
