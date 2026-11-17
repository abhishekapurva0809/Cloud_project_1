# Project 1 — Smart Visitor Counter (Virtual 3D Hardware Lab & AWS Cloud Twin)

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![AWS IoT Core](https://img.shields.io/badge/AWS-IoT_Core-FF9900?logo=amazonaws&logoColor=white)](https://aws.amazon.com/iot-core/)
[![Amazon DynamoDB](https://img.shields.io/badge/Amazon-DynamoDB-4053D6?logo=amazondynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)

An interactive **Virtual 3D Demonstration & Digital Twin** for an IoT Smart Visitor Counter.
This application simulates the physical electronics hardware (ESP32, breadboard, push button, LED, 0.96" OLED display, jumper wires) and connects directly to the end-to-end **AWS Serverless Cloud Pipeline** (`ESP32 ➔ AWS IoT Core ➔ AWS Lambda ➔ Amazon DynamoDB ➔ Web Dashboard`).

> **Zero Physical Hardware Required:** All components, electrical behaviors, tactile switch mechanics, diode illumination, and cloud messaging are simulated and operable inside the web browser with real-time bidirectional synchronization.

---

## 🌟 Key Features

### 1. Interactive 3D Virtual Hardware Lab
* **3D Electronics Prototype:** Modeled on an anti-static ESD workbench using Three.js and React Three Fiber.
* **ESP32 DevKit Board:** Accurate dual-layer PCB with ESP-WROOM-32 RF metal shield, USB port, power LED, and GPIO pin headers.
* **MB-102 Solderless Breadboard:** Realistic power rails (+/-), numbered tie-point rows (A–J, 1–30), and center IC notch.
* **Tactile Push Button with Spring Kinematics:** 12×12mm switch that physically depresses on click with smooth spring return kinematics.
* **Synthesized Tactile Audio:** Mechanical snap and spring resonance generated dynamically on the fly via the Web Audio API (zero audio files needed).
* **0.96" SSD1306 I2C OLED Display:** Dynamic canvas-rendered screen displaying live visitor count, WiFi signal, and telemetry status (`TX MQTT...`).
* **5mm Red Indicator LED:** Smooth analog diode activation with fast attack and exponential phosphor decay, casting dynamic 3D light onto the board.
* **Accurate Circuit Pinout:** DuPont jumper wires routing GPIO 4 (Button Interrupt), GPIO 2 (LED status), and I2C lines (SDA/SCL).
* **Floating 3D Zoom Dock & Presets:** Dedicated on-screen `+` and `−` zoom buttons with live percentage HUD and instant camera presets (`ISO`, `TOP`, `FOCUS`).

### 2. Dual-Mode Cloud Architecture (Simulation or Real AWS)
* **High-Fidelity Virtual Simulation:** Operates without AWS credentials, producing authentic request IDs, millisecond latencies, and step-by-step pipeline execution logs.
* **Direct Real AWS Integration:** Built-in zero-dependency AWS Signature Version 4 (SigV4) client:
  * **Amazon DynamoDB:** Executes atomic `UpdateItem` with expression `ADD visitorCount :val` (guaranteed zero race conditions).
  * **AWS IoT Core Data Plane:** Real-time HTTP REST MQTT publishing to `iot/smart-visitor/counter` with QoS 1.
  * **Automated Table Provisioning:** Creates the `IoT_VisitorCounter_Store` table with On-Demand Serverless capacity with 1 click.
  * **IAM Credentials Modal:** Support for standard IAM users and temporary credentials (AWS Academy, Learner Lab, SSO/STS).

### 3. Real-Time Telemetry & Data Flow
* **5-Stage Pipeline Flow:** Animated glowing data packets visually travel across `ESP32` ➔ `AWS IoT Core` ➔ `AWS Lambda` ➔ `Amazon DynamoDB` ➔ `Web Dashboard`.
* **Synchronized Display Guarantee:** The visitor count updates on the 3D OLED screen and dashboard analytics **strictly after** the cloud confirms commitment.
* **Live Telemetry Terminal:** Timestamped execution log filterable by `ALL`, `ESP32`, `AWS CLOUD`, and `VISITORS`.
* **Interactive Component Inspector:** Click any 3D part or cloud node to inspect technical specifications, schematics, and production code snippets.
* **Automated Traffic Simulator:** Hands-free traffic simulation mode with adjustable interval speeds (1.5s, 3.0s, 5.0s), pause, and reset controls.

---

## 📐 System Architecture

```text
[ 3D Virtual Hardware Lab ]
         │
         │ (User clicks 3D Push Button)
         ▼
 ┌───────────────┐
 │ ESP32 (GPIO4) │ ── Physical plunger motion + Web Audio click + LED flash (GPIO 2)
 └───────┬───────┘
         │ MQTT Message over TLS 1.3
         ▼
 ┌───────────────┐
 │  AWS IoT Core │ ── Topic: iot/smart-visitor/counter (QoS 1)
 └───────┬───────┘
         │ IoT SQL Topic Rule Trigger
         ▼
 ┌───────────────┐
 │   AWS Lambda  │ ── Serverless execution: processVisitorCounter() (Node.js 20.x)
 └───────┬───────┘
         │ Atomic UpdateItem: ADD visitorCount 1
         ▼
 ┌───────────────┐
 │Amazon DynamoDB│ ── Table: IoT_VisitorCounter_Store (No race conditions)
 └───────┬───────┘
         │ Server-Sent Events (SSE) / WebSocket Broadcast
         ▼
 ┌───────────────┐
 │ Web Dashboard │ ── 3D OLED Display & KPI Analytics synchronized
 └───────────────┘
```

---

## 🗂️ Project Structure

```text
cloud project 1/
│
├── backend/
│   ├── controllers/
│   │   └── visitorController.js      # REST API, SSE streaming & AWS handlers
│   ├── models/
│   │   └── mockDynamoDB.js           # In-memory store & fallback simulation state
│   ├── routes/
│   │   └── visitorRoutes.js          # API routing endpoints (/api/visitor/*)
│   ├── services/
│   │   ├── awsClient.js              # Native SigV4 client for DynamoDB & IoT Core
│   │   └── awsSimulationService.js   # 5-stage pipeline telemetry simulator
│   ├── aws-config.example.json       # AWS credentials template
│   ├── package.json
│   └── server.js                     # Express server & unified production host
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Audio/
│   │   │   │   └── soundEffects.js          # Web Audio API tactile audio engine
│   │   │   ├── CloudArchitecture/
│   │   │   │   └── CloudFlowPanel.jsx       # 5-stage animated cloud flow visualizer
│   │   │   ├── CloudSettingsModal/
│   │   │   │   └── CloudSettingsModal.jsx   # AWS IAM setup & connection testing
│   │   │   ├── Dashboard/
│   │   │   │   ├── ControlsBar.jsx          # Actions, presets & simulation controls
│   │   │   │   ├── StatCard.jsx             # KPI metric cards
│   │   │   │   └── VisitorChart.jsx         # Hourly distribution bar chart
│   │   │   ├── Device3D/
│   │   │   │   ├── Breadboard.jsx           # MB-102 solderless breadboard
│   │   │   │   ├── ComponentLabels.jsx      # Floating 3D annotation markers
│   │   │   │   ├── DeviceCanvas.jsx         # Canvas with floating zoom controls
│   │   │   │   ├── ESP32.jsx                # ESP32-WROOM board model
│   │   │   │   ├── JumperWires.jsx          # Curved DuPont wire geometry
│   │   │   │   ├── LabDesk.jsx              # ESD workbench & grid texture
│   │   │   │   ├── LED.jsx                  # 5mm diffused LED with PointLight
│   │   │   │   ├── OledDisplay.jsx          # SSD1306 dynamic canvas OLED screen
│   │   │   │   ├── PushButton.jsx           # Tactile button with spring physics
│   │   │   │   ├── Resistor.jsx             # 220-ohm color-coded axial resistor
│   │   │   │   └── UsbCable.jsx             # Micro-USB cable
│   │   │   ├── EventLog/
│   │   │   │   └── EventConsole.jsx         # Real-time telemetry terminal
│   │   │   ├── InspectorModal/
│   │   │   │   └── ComponentInspector.jsx   # Technical pinout & code inspector
│   │   │   └── Navbar.jsx                   # Status badges & AWS connection pill
│   │   ├── hooks/
│   │   │   └── useVisitorSimulation.js      # Central hardware & pipeline state engine
│   │   ├── services/
│   │   │   └── api.js                       # Frontend API client
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── deploy-ec2.sh                     # Automated Ubuntu EC2 installation & Nginx setup
├── upload-to-ec2.ps1                 # Windows 1-click direct SCP deploy (no Git needed)
├── Dockerfile                        # Multi-stage container build
├── .dockerignore
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/abhishekapurva0809/Cloud_project_1.git
cd Cloud_project_1
```

### 2. Start the Backend Server
```bash
cd backend
npm install
npm start
```
* Backend runs on **`http://localhost:5001`**
* Health check: `http://localhost:5001/api/health`

### 3. Start the Frontend Application
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
* Open your browser at **`http://localhost:3000`**

---

## ☁️ Connecting to Live AWS Cloud

The application works out of the box in **Virtual Simulation Mode**. To connect it to your live AWS account:

1. Open the website at `http://localhost:3000` (or your deployed URL).
2. Click the amber button in the navigation bar: **`[ ☁️ AWS: SIMULATED (CONNECT) ]`**.
3. Toggle mode to **`Real AWS Cloud`**.
4. Enter your details:
   * **AWS Region**: e.g., `us-east-1`, `ap-south-1`, `eu-west-1`.
   * **AWS Access Key ID**: Starts with `AKIA...` (or `ASIA...`).
   * **AWS Secret Access Key**: Your secret key.
   * **AWS Session Token**: *(Optional)* Required only for AWS Academy / Learner Lab / SSO.
   * **DynamoDB Table**: Defaults to `IoT_VisitorCounter_Store`.
5. Click **`Test AWS Credentials`**:
   * If the table does not exist yet, click **`Create Table Automatically Now`**.
6. Click **`Save & Activate`**.

### Required AWS IAM Policy
Attach this policy to your IAM user or EC2 role:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:UpdateItem",
        "dynamodb:GetItem",
        "dynamodb:DescribeTable",
        "dynamodb:CreateTable"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/IoT_VisitorCounter_Store"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish"
      ],
      "Resource": "arn:aws:iot:*:*:topic/iot/smart-visitor/counter"
    }
  ]
}
```

---

## 🚀 AWS Deployment Options

### Option A: 1-Click Direct Deploy to EC2 (No GitHub Required)
Launch an Ubuntu 24.04 LTS `t2.micro` instance (Free Tier) in the AWS Console, then run this from PowerShell on your Windows machine:

```powershell
.\upload-to-ec2.ps1 -IpAddress "<YOUR-EC2-PUBLIC-IP>" -KeyPath "C:\path\to\your-key.pem"
```

The script automatically:
* Packages your code excluding `node_modules`.
* Transfers the bundle via `scp.exe` to your EC2 instance.
* Sets up a 2GB Swap file (prevents out-of-memory errors on `t2.micro`).
* Installs Node.js 20, Nginx, and PM2.
* Serves the 3D application on Port 80 under your official `*.amazonaws.com` URL.

### Option B: Docker Container
Build and run the unified container locally or on AWS App Runner / ECS:

```bash
# Build the multi-stage container
docker build -t smart-visitor-counter .

# Run the container
docker run -d -p 5001:5001 --name visitor-counter smart-visitor-counter
```
Open `http://localhost:5001` in your browser.

---

## 🎮 How to Interact with the Virtual Lab

| Action | Control | Result |
| :--- | :--- | :--- |
| **Orbit / Rotate** | Left-click + drag in 3D viewport | 360° rotation around the hardware |
| **Pan** | Right-click + drag | Move across the ESD workbench |
| **Zoom In / Out** | Click floating **`+`** / **`−`** buttons | Smooth camera zoom with percentage HUD |
| **Camera Presets** | Click **`ISO`**, **`TOP`**, or **`FOCUS`** | Instantly snap to isometric, top-down, or switch view |
| **Press Button** | Click the 3D push button on the breadboard | Triggers plunger compression, click sound, LED & pipeline |
| **Inspect Part** | Click any component (ESP32, OLED, etc.) | Opens technical datasheet, circuit theory & code |
| **Auto Simulation** | Click **`▶ Start Simulation`** | Generates virtual traffic automatically |
| **Reset** | Click **`↺ Reset`** | Restores counter to benchmark #127 |

---

## 🛠️ Tech Stack

* **3D Visuals:** Three.js, `@react-three/fiber`, `@react-three/drei`
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
* **Audio:** Web Audio API (real-time procedural oscillator & white-noise synthesizer)
* **Backend:** Node.js, Express.js, Server-Sent Events (SSE)
* **AWS Cloud:** Signature Version 4 (SigV4) crypto implementation, Amazon DynamoDB, AWS IoT Core
* **Deployment:** Nginx reverse proxy, PM2 process manager, Docker, AWS EC2

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
