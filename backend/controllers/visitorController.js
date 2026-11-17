import { db } from "../models/mockDynamoDB.js";
import { simulatePipelineExecution } from "../services/awsSimulationService.js";
import { awsClient } from "../services/awsClient.js";

// Keep active SSE clients for live broadcasts
let sseClients = [];

export function registerSSEClient(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial state with AWS configuration info
  const initialStatus = {
    ...db.getStatus(),
    aws: awsClient.getPublicConfig()
  };
  res.write(`data: ${JSON.stringify({ type: "INIT", data: initialStatus })}\n\n`);

  req.on("close", () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
}

export function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

export const getStatus = async (req, res) => {
  try {
    const status = db.getStatus();
    const aws = awsClient.getPublicConfig();

    // If connected to real AWS, optionally pull latest DynamoDB counter
    if (awsClient.isConfigured()) {
      try {
        const liveCount = await awsClient.getDynamoDbVisitorCount();
        if (!isNaN(liveCount) && liveCount > 0) {
          status.counts.current = liveCount;
          status.systemStatus = "REAL_AWS_ONLINE";
          status.simulationEnvironment = `Amazon DynamoDB (${aws.region}) + AWS IoT Core`;
        }
      } catch (e) {
        console.warn("Could not fetch initial live count from DynamoDB:", e.message);
      }
    }

    res.json({
      success: true,
      data: {
        ...status,
        aws
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const pressButton = async (req, res) => {
  try {
    const trigger = req.body?.trigger || "HARDWARE_PUSHBUTTON";

    // 1. Check if Real AWS is enabled and configured
    if (awsClient.isConfigured()) {
      const startTime = Date.now();
      const timeStr = new Date().toLocaleTimeString();

      try {
        // Real AWS IoT Core HTTP Publish
        const iotPubResult = await awsClient.publishToIotCore({
          deviceId: db.deviceConfig.deviceId,
          trigger,
          timestamp: new Date().toISOString()
        });

        // Real DynamoDB Atomic UpdateItem
        const ddbResult = await awsClient.incrementDynamoDbVisitor(db.deviceConfig.deviceId, 1);
        const totalDurationMs = Date.now() - startTime;

        // Sync local memory store
        db.counts.current = ddbResult.newCount;
        db.counts.today += 1;
        db.counts.total += 1;

        const newEvent = {
          id: `evt-aws-${ddbResult.newCount}`,
          count: ddbResult.newCount,
          timestamp: new Date().toISOString(),
          timeFormatted: timeStr,
          trigger,
          source: "ESP32 (GPIO 4) ➔ Real AWS Cloud",
          awsLatencyMs: totalDurationMs,
          status: "COMMITTED_AWS"
        };
        db.events.unshift(newEvent);
        if (db.events.length > 50) db.events.pop();

        const result = {
          success: true,
          trigger,
          isRealAws: true,
          counts: { ...db.counts },
          newEvent,
          lastEvent: {
            timestamp: newEvent.timestamp,
            timeFormatted: timeStr,
            description: `Visitor #${ddbResult.newCount} recorded directly in Amazon DynamoDB`
          },
          telemetry: {
            messageId: `aws-msg-${Date.now()}`,
            lambdaRequestId: `real-cloud-exec-${Date.now().toString(36)}`,
            dynamoDbRequestId: `DDB-${Date.now().toString(16).toUpperCase()}`,
            totalDurationMs,
            steps: [
              {
                step: 1,
                stage: "ESP32",
                title: "GPIO Interrupt Triggered",
                timestamp: timeStr,
                durationMs: 4,
                details: `GPIO Pin ${db.deviceConfig.gpioPin} detected falling edge (0V). Debounce filter verified contact closure.`
              },
              {
                step: 2,
                stage: "AWS_IOT_CORE",
                title: "Live AWS IoT Core MQTT Publish",
                timestamp: timeStr,
                durationMs: 25,
                details: iotPubResult.published
                  ? `Published to topic '${awsClient.config.mqttTopic}' via HTTP REST data plane on ${awsClient.config.iotEndpoint || 'AWS IoT Core'}`
                  : `Real IoT Core topic '${awsClient.config.mqttTopic}' targeted. (Endpoint: ${awsClient.config.iotEndpoint || "Default Region Endpoint"})`
              },
              {
                step: 3,
                stage: "LAMBDA",
                title: "Cloud Pipeline Executed",
                timestamp: timeStr,
                durationMs: 18,
                details: `Signed AWS SigV4 request authenticated in region ${awsClient.config.region}.`
              },
              {
                step: 4,
                stage: "DYNAMODB",
                title: "Amazon DynamoDB Atomic UpdateItem",
                timestamp: timeStr,
                durationMs: Math.max(30, totalDurationMs - 47),
                details: `Table: '${awsClient.config.dynamoDbTable}' | Region: ${awsClient.config.region} | visitorCount incremented to ${ddbResult.newCount}!`
              },
              {
                step: 5,
                stage: "DASHBOARD",
                title: "3D Virtual Twin Synchronized",
                timestamp: timeStr,
                durationMs: 8,
                details: `Live state synchronized from Amazon DynamoDB to 3D OLED and web dashboard.`
              }
            ]
          }
        };

        // Broadcast to all SSE listeners
        broadcastSSE({
          type: "VISITOR_EVENT",
          data: result
        });

        return res.json(result);
      } catch (awsError) {
        console.warn("Real AWS execution encountered error, falling back to simulation:", awsError.message);
        // Fallback gracefully so demo keeps working smoothly
        const fallbackResult = simulatePipelineExecution(trigger);
        fallbackResult.telemetry.steps.push({
          step: 8,
          stage: "DYNAMODB",
          title: "Real AWS Note",
          timestamp: timeStr,
          durationMs: 0,
          details: `AWS Warning: ${awsError.message}. Used local fallback for seamless UX.`
        });

        broadcastSSE({
          type: "VISITOR_EVENT",
          data: fallbackResult
        });

        return res.json({
          ...fallbackResult,
          isRealAws: false,
          awsWarning: awsError.message
        });
      }
    }

    // 2. Default Local Virtual Simulation
    const result = simulatePipelineExecution(trigger);

    // Broadcast to all SSE listeners
    broadcastSSE({
      type: "VISITOR_EVENT",
      data: result
    });

    res.json({ success: true, isRealAws: false, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const resetCounter = (req, res) => {
  try {
    db.reset();
    const status = db.getStatus();

    broadcastSSE({
      type: "RESET",
      data: status
    });

    res.json({ success: true, message: "Device counter reset successfully", data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHistory = (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const events = db.getEvents(limit);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStats = (req, res) => {
  try {
    const hourly = db.getHourlyStats();
    res.json({ success: true, data: { hourly } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Real AWS Configuration Endpoints ---

export const getAwsConfig = (req, res) => {
  try {
    res.json({ success: true, data: awsClient.getPublicConfig() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAwsConfig = (req, res) => {
  try {
    const updated = awsClient.saveConfig(req.body);
    broadcastSSE({
      type: "AWS_CONFIG_UPDATED",
      data: updated
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const testAwsConnection = async (req, res) => {
  try {
    // If credentials passed directly in request body, temporarily apply or test with them
    if (req.body?.accessKeyId && req.body?.secretAccessKey) {
      awsClient.saveConfig(req.body);
    }
    const result = await awsClient.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createAwsTable = async (req, res) => {
  try {
    const result = await awsClient.createTableIfNotExists();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
