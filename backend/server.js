import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import visitorRoutes from "./routes/visitorRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"]
}));
app.use(express.json());

// API Routes
app.use("/api/visitor", visitorRoutes);

// System Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "Smart Visitor Counter - Virtual AWS Service",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if present (for single-container/EC2/App Runner deployment)
const distPath = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Smart Visitor Counter - Virtual AWS Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`⚡ API Root: http://localhost:${PORT}/api/visitor`);
  console.log(`🔄 Real-time Event Stream: http://localhost:${PORT}/api/visitor/stream`);
  if (fs.existsSync(distPath)) {
    console.log(`🌐 Static Web UI mounted from: ${distPath}`);
  }
  console.log(`====================================================`);
});
