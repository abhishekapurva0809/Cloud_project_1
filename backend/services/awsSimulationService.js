/**
 * AWS Simulation Service
 * Models the end-to-end cloud pipeline:
 * ESP32 -> AWS IoT Core -> AWS Lambda -> Amazon DynamoDB -> Web Dashboard
 */

import { db } from "../models/mockDynamoDB.js";

export function simulatePipelineExecution(trigger = "HARDWARE_PUSHBUTTON") {
  const startTime = Date.now();
  const device = db.deviceConfig;

  // Perform database update
  const { counts, newEvent, lastEvent } = db.incrementVisitor(trigger);

  // Generate realistic AWS request identifiers
  const messageId = `msg-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
  const lambdaRequestId = `${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}-4a2e-b871-${Math.random().toString(36).substring(2, 14)}`;
  const dynamoDbRequestId = `DDB-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

  const now = new Date();
  const timeStr = now.toLocaleTimeString();

  // Create technical timeline steps
  const steps = [
    {
      step: 1,
      stage: "ESP32",
      title: "GPIO Interrupt Triggered",
      timestamp: timeStr,
      durationMs: 4,
      details: `GPIO Pin ${device.gpioPin} detected falling edge (0V). Debounce filter verified contact closure.`
    },
    {
      step: 2,
      stage: "ESP32",
      title: "MQTT Payload Formatted",
      timestamp: timeStr,
      durationMs: 8,
      details: `Prepared JSON payload: {"deviceId": "${device.deviceId}", "counter": ${counts.current}, "timestamp": ${startTime}}`
    },
    {
      step: 3,
      stage: "AWS_IOT_CORE",
      title: "MQTT Message Published to IoT Core",
      timestamp: timeStr,
      durationMs: 22,
      details: `Topic: ${device.mqttTopic} | QoS: 1 | Client: ${device.deviceId} | TLS 1.3 mutual auth verified`
    },
    {
      step: 4,
      stage: "AWS_IOT_CORE",
      title: "IoT SQL Topic Rule Matched",
      timestamp: timeStr,
      durationMs: 6,
      details: `Rule 'SmartVisitorCounterRule' SELECT * FROM '${device.mqttTopic}' invoked Lambda action`
    },
    {
      step: 5,
      stage: "LAMBDA",
      title: "AWS Lambda Invocation (processVisitorCount)",
      timestamp: timeStr,
      durationMs: 38,
      details: `Runtime: Node.js 20.x | Memory: 128MB | RequestId: ${lambdaRequestId} | Processed visitor #${counts.current}`
    },
    {
      step: 6,
      stage: "DYNAMODB",
      title: "DynamoDB Atomic UpdateItem",
      timestamp: timeStr,
      durationMs: 24,
      details: `Table: 'IoT_VisitorCounter_Store' | Key: {deviceId: "${device.deviceId}"} | ADD visitorCount :val`
    },
    {
      step: 7,
      stage: "DASHBOARD",
      title: "S3 Dashboard Synchronized",
      timestamp: timeStr,
      durationMs: 12,
      details: `WebSocket / CloudFront event pushed to connected web dashboard. Display refreshed to ${counts.current}.`
    }
  ];

  const totalDurationMs = steps.reduce((sum, s) => sum + s.durationMs, 0);

  return {
    success: true,
    trigger,
    counts,
    newEvent,
    lastEvent,
    telemetry: {
      messageId,
      lambdaRequestId,
      dynamoDbRequestId,
      totalDurationMs,
      steps
    }
  };
}
