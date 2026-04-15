import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: `JWT verified successfully for ${req.user.name}.`,
    checklist: [
      "Client-side form validation completed",
      "Token verified by Express middleware",
      "Route guard allowed authenticated access",
      `Active role detected: ${req.user.role}`,
    ],
  });
});

router.get("/admin", verifyToken, checkRole("admin"), async (req, res) => {
  const users = await User.find().select("name email role -_id").sort({ role: 1, name: 1 });

  res.json({
    message: "Admin access granted. RBAC checks passed on both route and API layers.",
    users,
  });
});

export default router;
