import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import broadcastRoutes from "./routes/broadcasts.js";
import settingsRoutes from "./routes/settings.js";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/broadcasts", broadcastRoutes);
app.use("/api/settings", settingsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: err.message || "Internal server error",
    });
  },
);

app.listen(PORT, () => {
  console.log(`🚀 Church Communication Backend running on http://localhost:${PORT}`);
  console.log(`📡 Twilio configured for SMS via: ${process.env.TWILIO_PHONE_NUMBER}`);
  console.log(`✨ CORS enabled for: ${CORS_ORIGIN}`);
});
