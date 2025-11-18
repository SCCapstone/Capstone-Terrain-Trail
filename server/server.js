import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "1.0" });
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    username: { type: String, trim: true, unique: true, sparse: true},
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

/*  Auth middleware for settings routes */

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({message: "Missing token" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev"
    );
    req.userId = payload.sub;
    next();

  }
  catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/* ===== Auth routes ===== */
app.post("/api/signup", async (req, res) => {
  try {
    const { name, username, email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ message: "Email already in use" });
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(409).json({message: "Username already in use"});
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash });

    res.status(201).json({ message: "User created" });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "Duplicate field" });
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET || "dev", { expiresIn: "7d" });
    res.json({ message: "Logged in", token });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ==== Settings/ Account routes ==== */

/**
 * GET /api/account 
 * populate fields with current user data
 */
app.get("/api/account", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "name username email"
    );
    if (!user) {
      return res.status(404).json({message: "User not found" });
    }
    res.json({ user });
  }
  catch (err) {
    res.status(500).json({message: "Server error" });
  }
});
/**
 * PUT /api/account
 * Body can cantain: name, email, currentPassword, newPassword
 */
app.put("/api/account", requireAuth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body || {};

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name/email if provided
    if (typeof name === "string") user.name = name.trim();
    if (typeof email === "string") user.email = email.trim().toLowerCase();

    // Handle password change 
    if (newPassword || currentPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required to change password" });
      }

      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) {
        return res.status(400).json({ message: "Incorrect current password" });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          message: "New password must be at least 6 characters",
        });
      }
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      message: "Changes saved",
      user: { name: user.name, username: user.username, email: user.email },
    });
  }
  catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected");
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Error starting server:", err.message);
  }
}

start();