import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import User from "./models/User.js";
import { config } from "./config.js";
import { hashPassword } from "./utils/password.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = [...new Set([...config.clientUrls, "http://localhost:5173"])];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS."));
    },
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@amazonia.com",
    password: "Admin@123",
    role: "admin",
  },
  {
    name: "Regular User",
    email: "user@amazonia.com",
    password: "User@1234",
    role: "user",
  },
];

async function seedDatabase() {
  for (const user of seedUsers) {
    const existingUser = await User.findOne({ email: user.email });
    const payload = {
      name: user.name,
      email: user.email,
      password: hashPassword(user.password),
      role: user.role,
    };

    if (existingUser) {
      existingUser.name = payload.name;
      existingUser.password = payload.password;
      existingUser.role = payload.role;
      await existingUser.save();
      continue;
    }

    await User.create(payload);
  }
}

async function startServer() {
  if (!config.mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env.");
  }

  await mongoose.connect(config.mongoUri);
  await seedDatabase();

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

startServer().catch(async (error) => {
  console.error("Failed to start server:", error.message);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
