import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import dataRoutes from "./routes/data.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to AgriSense BD API"
  });
});

app.use("/api/health", healthRoutes);
app.use("/api", dataRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

app.use((err, req, res, next) => {
  console.error("API Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

export default app;