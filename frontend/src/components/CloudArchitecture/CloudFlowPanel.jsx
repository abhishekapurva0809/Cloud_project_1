import React from "react";
import { 
  Cpu, 
  Wifi, 
  Cloud, 
  Terminal, 
  Database, 
  LayoutDashboard, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Info 
} from "lucide-react";

export default function CloudFlowPanel({ 
  cloudActiveStep = 0, // 0=idle, 1=ESP32, 2=IoT Core, 3=Lambda, 4=DynamoDB, 5=Dashboard
  pipelineProgress = 0, // 0-100 continuous float
  awsConfig = null,
  onSelectComponent 
}) {
  const isRealAws = awsConfig?.mode === "REAL" && awsConfig?.hasCredentials;
  const region = awsConfig?.region || "us-east-1";
  const tableName = awsConfig?.dynamoDbTable || "IoT_VisitorCounter_Store";
  const iotEndpoint = awsConfig?.iotEndpoint || "a3k8917x-ats.iot.us-east-1.amazonaws.com";
  const mqttTopic = awsConfig?.mqttTopic || "iot/smart-visitor/counter";

  const nodes = [
    {
      id: "esp32",
      step: 1,
      title: "ESP32",
      role: "Microcontroller",
      subtitle: "GPIO 4 ISR → MQTT",
      icon: Cpu,
      color: "cyan",
      tag: "FreeRTOS / C++",
      details: {
        title: "ESP32-S3 Microcontroller",
        category: "Edge Hardware",
        status: "Online / WiFi Active",
        specs: [
          { label: "MCU Core", value: "Xtensa 32-bit LX7 Dual-Core @ 240MHz" },
          { label: "Pushbutton Pin", value: "GPIO 4 (Internal Pull-Up enabled)" },
          { label: "Status LED", value: "GPIO 2 (Active High output)" },
          { label: "OLED Protocol", value: "I2C (SDA: GPIO 21, SCL: GPIO 22)" },
          { label: "WiFi Standard", value: "802.11 b/g/n (2.4 GHz, WPA2-Enterprise)" },
          { label: "Security", value: "Hardware Cryptographic Accelerator (AES, SHA, RSA)" }
        ],
        codeSample: `// ESP32 Button Interrupt & MQTT Publication
#include <WiFi.h>
#include <PubSubClient.h>

const int BUTTON_PIN = 4;
volatile bool buttonPressed = false;

void IRAM_ATTR isr() {
  buttonPressed = true;
}

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), isr, FALLING);
  connectToAwsIot();
}

void loop() {
  if (buttonPressed) {
    buttonPressed = false;
    char payload[64];
    sprintf(payload, "{\\"deviceId\\":\\"ESP32-01\\",\\"increment\\":1}");
    client.publish("iot/smart-visitor/counter", payload);
  }
}`
      }
    },
    {
      id: "iot_core",
      step: 2,
      title: "AWS IoT Core",
      role: "Message Broker",
      subtitle: `Topic: ${mqttTopic.split('/').pop()}`,
      icon: Cloud,
      color: "blue",
      tag: "MQTT / TLS 1.3",
      details: {
        title: "AWS IoT Core Message Broker",
        category: "Cloud Ingestion",
        status: isRealAws ? `Live AWS (${region})` : "Connected & Receiving",
        specs: [
          { label: "Endpoint", value: iotEndpoint },
          { label: "Protocol", value: "MQTT v3.1.1 over TLS 1.3 (Port 8883)" },
          { label: "Topic Pattern", value: mqttTopic },
          { label: "Authentication", value: "X.509 Device Certificate + AWS IoT Policy" },
          { label: "IoT SQL Rule", value: `SELECT * FROM '${mqttTopic}'` },
          { label: "Rule Target", value: `arn:aws:lambda:${region}:123456789012:function:processVisitorCounter` }
        ],
        codeSample: `-- AWS IoT Core SQL Rule Definition
SELECT 
  deviceId, 
  timestamp() as receivedAt,
  traceId 
FROM '${mqttTopic}'
WHERE deviceId IS NOT NULL`
      }
    },
    {
      id: "lambda",
      step: 3,
      title: "AWS Lambda",
      role: "Serverless Compute",
      subtitle: "processVisitorCount()",
      icon: Terminal,
      color: "amber",
      tag: "Node.js 20.x",
      details: {
        title: "AWS Lambda Serverless Function",
        category: "Cloud Processing",
        status: "Active (Warm execution)",
        specs: [
          { label: "Function Name", value: "processVisitorCounter" },
          { label: "Runtime", value: "Node.js 20.x (ARM64 Graviton3)" },
          { label: "Allocated Memory", value: "128 MB" },
          { label: "Average Latency", value: "~34 ms" },
          { label: "Region", value: region },
          { label: "Target Table", value: tableName }
        ],
        codeSample: `// AWS Lambda Function Handler
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({ region: "${region}" });

export const handler = async (event) => {
  const { deviceId } = event;
  const command = new UpdateItemCommand({
    TableName: "${tableName}",
    Key: { deviceId: { S: deviceId } },
    UpdateExpression: "ADD visitorCount :val SET lastSeen = :now",
    ExpressionAttributeValues: {
      ":val": { N: "1" },
      ":now": { S: new Date().toISOString() }
    },
    ReturnValues: "ALL_NEW"
  });
  return await ddb.send(command);
};`
      }
    },
    {
      id: "dynamodb",
      step: 4,
      title: "DynamoDB",
      role: "NoSQL Database",
      subtitle: "Atomic ADD Counter",
      icon: Database,
      color: "purple",
      tag: "Single-Digit ms",
      details: {
        title: "Amazon DynamoDB NoSQL Database",
        category: "Cloud Persistence",
        status: isRealAws ? `Live AWS (${region})` : "Active / On-Demand Capacity",
        specs: [
          { label: "Table Name", value: tableName },
          { label: "Region", value: region },
          { label: "Partition Key", value: "deviceId (String)" },
          { label: "Billing Mode", value: "PAY_PER_REQUEST (Serverless On-Demand)" },
          { label: "Encryption", value: "AWS KMS (KMS-Managed Key)" },
          { label: "Atomic Guarantee", value: "ADD visitorCount :inc (No race conditions)" }
        ],
        codeSample: `// DynamoDB Atomic Increment Query
aws dynamodb update-item \\
  --region ${region} \\
  --table-name ${tableName} \\
  --key '{"deviceId": {"S": "ESP32-S3-WROOM-01"}}' \\
  --update-expression "ADD visitorCount :inc" \\
  --expression-attribute-values '{":inc": {"N": "1"}}' \\
  --return-values UPDATED_NEW`
      }
    },
    {
      id: "dashboard",
      step: 5,
      title: "Web Dashboard",
      role: "Frontend Monitoring",
      subtitle: "Real-Time S3 / CDN",
      icon: LayoutDashboard,
      color: "emerald",
      tag: "React + 3D Three.js",
      details: {
        title: "Web Dashboard & S3 Static Hosting",
        category: "Client Application",
        status: "Subscribed / Real-time View",
        specs: [
          { label: "Delivery", value: "Amazon CloudFront CDN + S3 Bucket" },
          { label: "Sync Engine", value: "Server-Sent Events / API Polling" },
          { label: "3D Visualizer", value: "Three.js / React Three Fiber" },
          { label: "Client Latency", value: "< 100 ms End-to-End" },
          { label: "SSL / TLS", value: "HTTPS via AWS Certificate Manager" }
        ],
        codeSample: `// React State Update on Ingested Event
function onTelemetryReceived(payload) {
  setVisitorCount(payload.visitorCount);
  playSubtleHapticFeedback();
  refreshActivityChart();
}`
      }
    }
  ];

  return (
    <div className="rounded-xl bg-[#0f172a]/80 backdrop-blur-md border border-cyan-500/20 p-4 sm:p-5 shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <span>CLOUD ARCHITECTURE DATA FLOW</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isRealAws 
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                : "bg-cyan-950 text-cyan-300 border-cyan-500/30"
            }`}>
              {isRealAws ? `REAL AWS (${region})` : "VIRTUAL PIPELINE"}
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 font-mono">
            Click any component to inspect technical architecture & code
          </p>
        </div>

        {/* Real-time packet status indicator */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
            cloudActiveStep > 0 ? 'bg-cyan-400 shadow-md shadow-cyan-400' : 'bg-slate-600'
          }`} />
          <span className={cloudActiveStep > 0 ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
            {cloudActiveStep === 0 ? "PIPELINE READY" : `TRANSMITTING [STAGE ${cloudActiveStep}/5]`}
          </span>
        </div>
      </div>

      {/* Sequential Cloud Nodes with Animated Glowing Data Connectors */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
        {nodes.map((node, index) => {
          const isActive = cloudActiveStep === node.step;
          const isPassed = cloudActiveStep > node.step;
          const Icon = node.icon;

          return (
            <div key={node.id} className="relative flex flex-col">
              {/* Card Container with fixed min-height to guarantee zero layout shifts */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelectComponent) onSelectComponent(node.details);
                }}
                className={`w-full min-h-[142px] flex flex-col justify-between text-left p-3 rounded-xl border transition-all duration-300 ease-out relative group overflow-hidden ${
                  isActive
                    ? "bg-cyan-950/95 border-cyan-400 shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-400/80"
                    : isPassed
                    ? "bg-[#111928]/90 border-emerald-500/50 text-slate-200"
                    : "bg-[#0b1120]/75 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-[#111928]"
                }`}
              >
                {/* Active pulsating beacon */}
                {isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/60" 
                        : isPassed
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 group-hover:text-cyan-400"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                      isActive 
                        ? "bg-cyan-900/80 text-cyan-200 border-cyan-400 font-bold" 
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}>
                      0{node.step}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                      <span>{node.title}</span>
                      <Info className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-[10px] text-cyan-400/90 font-medium">{node.role}</p>
                    <p className="text-[9px] text-slate-400 font-mono truncate">{node.subtitle}</p>
                  </div>
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-400">{node.tag}</span>
                  {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-in fade-in" />}
                </div>
              </button>

              {/* Inter-node connector arrow for desktop */}
              {index < nodes.length - 1 && (
                <div className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center pointer-events-none">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                    cloudActiveStep === node.step || cloudActiveStep === node.step + 1
                      ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400"
                      : isPassed
                      ? "bg-emerald-500 text-black"
                      : "bg-slate-800 text-slate-600"
                  }`}>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Silky Continuous Glowing Data Packet Line */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Virtual Cloud Bus Telemetry</span>
          </span>
          <span className="text-cyan-300 font-bold font-mono">
            {cloudActiveStep > 0 ? `Packet In-Flight (${Math.round(pipelineProgress)}%)` : "Bus Idle • Ready"}
          </span>
        </div>

        {/* Continuous Progress Track with Glowing Particle Head */}
        <div className="relative h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          {/* Smooth Gradient Fill */}
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full shadow-md shadow-cyan-500/50"
            style={{ 
              width: `${pipelineProgress}%`,
              transition: pipelineProgress === 0 ? "none" : "width 50ms linear"
            }}
          />

          {/* Glowing Lead Particle */}
          {pipelineProgress > 0 && pipelineProgress < 100 && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-cyan-400 -ml-1.5 pointer-events-none"
              style={{ left: `${pipelineProgress}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
