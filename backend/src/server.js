import express from "express";
import cors from "cors";
import { config } from "./config.js";
import initialRoute from "./routes/initialRoute.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(express.json());

if (config.enableCors) {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    })
  );
}

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use("/api/initial", initialRoute);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`\n🚀 Data Edge Backend Server`);
  console.log(`📡 Running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health              - Health check`);
  console.log(`   GET  /api/initial         - Fetch all sources`);
  console.log(`   GET  /api/initial/source/:name - Fetch specific source`);
  console.log(`\n⚙️  API Configuration:`);
  console.log(
    `   The Odds:    ${config.apiKeys.theOdds ? "✅ Configured" : "❌ Not configured"}`
  );
  console.log(`\n⏱  Request timeout: ${config.timeout}ms\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received, shutting down gracefully...");
  process.exit(0);
});

