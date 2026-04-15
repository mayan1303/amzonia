import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { comparePassword } from "../utils/password.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email = "", password = "" } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || !comparePassword(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Authentication successful.",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

router.get("/me", verifyToken, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
