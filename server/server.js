import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

// health route
app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "1.0" });
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
