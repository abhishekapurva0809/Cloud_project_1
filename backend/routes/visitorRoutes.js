import express from "express";
import {
  getStatus,
  pressButton,
  resetCounter,
  getHistory,
  getStats,
  registerSSEClient,
  getAwsConfig,
  updateAwsConfig,
  testAwsConnection,
  createAwsTable
} from "../controllers/visitorController.js";

const router = express.Router();

router.get("/status", getStatus);
router.post("/press", pressButton);
router.post("/reset", resetCounter);
router.get("/history", getHistory);
router.get("/stats", getStats);
router.get("/stream", registerSSEClient);

// Real AWS endpoints
router.get("/aws-config", getAwsConfig);
router.post("/aws-config", updateAwsConfig);
router.post("/aws-test", testAwsConnection);
router.post("/aws-create-table", createAwsTable);

export default router;
