# Project 1 — Smart Visitor Counter (Virtual 3D Demonstration)

A complete **Virtual 3D Demonstration Website** for **Project 1 — Smart Visitor Counter**.
This project provides a high-fidelity web-based simulation of physical IoT hardware and the entire AWS serverless cloud pipeline.

**No physical ESP32, button, breadboard, wires, or electronics are required.** Everything is represented and operated virtually inside the 3D website.

---

## 🌟 Key Features

1. **Interactive 3D Virtual Hardware Lab**
   * **Full 3D Prototype**: Built with Three.js & React Three Fiber on an anti-static ESD workbench.
   * **ESP32 DevKit Board**: Detailed dual-layer PCB, metal RF shield (ESP-WROOM-32), USB port, status LEDs, and pin headers.
   * **MB-102 Solderless Breadboard**: Power rails (+ red, - blue), tie-point rows (A-J, 1-30), and center divider.
   * **Tactile Push Button**: 12x12mm 4-pin switch that physically depresses when clicked with spring physics.
   * **Dynamic 0.96" I2C OLED Display**: Real-time canvas-rendered SSD1306 screen displaying current visitor count, WiFi signal, and telemetry status.
   * **5mm Diffused Red LED**: Lights up with a dynamic 3D `PointLight` glow for ~750ms on each count.
   * **Curved DuPont Jumper Wires**: 3.3V (Red), GND (Black), GPIO 4 Signal (Yellow), GPIO 2 (Green), and I2C lines (Blue & Orange).
   * **Synthesized Tactile Audio**: Realistic mechanical contact click and spring release sound generated on the fly via the Web Audio API.

2. **Full End-to-End AWS Cloud Pipeline Simulation**
   * **Visual Cloud Architecture Panel**: Displays the 5 pipeline stages:
     `ESP32` ➔ `AWS IoT Core` ➔ `AWS Lambda` ➔ `Amazon DynamoDB` ➔ `Web Dashboard`.
   * **Animated Glowing Data Packet**: Visually travels across the cloud nodes in sequence whenever a visitor is detected.
   * **Virtual AWS Environment Mode**: Explicitly labels and simulates AWS IoT Core, Lambda, and DynamoDB behavior with realistic latencies, message IDs, and request tokens.

3. **Live Hardware & Cloud Telemetry Console**
   * Real-time technical log displaying millisecond timestamps.
   * Hardware GPIO 4 interrupt events, software debouncing verification.
   * MQTT publication to `iot/smart-visitor/counter` (QoS 1, TLS 1.3).
   * AWS Lambda invocation metrics (`processVisitorCounter`).
   * DynamoDB atomic `UpdateItem` operations.

4. **Educational Component Inspector**
   * Click any 3D component (ESP32, Button, LED, OLED, Breadboard) or Cloud node (IoT Core, Lambda, DynamoDB) to open a detailed technical specification sheet with pinouts, circuit theory, and code snippets.

5. **Analytics & Simulation Engine**
   * **Visitor Activity Timeline**: Interactive hourly distribution bar chart.
   * **Auto-Simulation Mode**: Automated virtual visitor traffic generator with Play, Pause, Reset, and interval speed controls.
   * **Camera Presets**: Quick camera switching between Isometric (ISO), Top-Down (TOP), and Close-Up (FOCUS).

---

## 📐 Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│ 3D PHYSICAL DEVICE SIMULATION                               │
│                                                             │
│   [ User Clicks 3D Push Button ]                            │
│                  ↓                                          │
│   Plunger Moves Down + Tactile Audio Click                  │
│                  ↓                                          │
│   ESP32 GPIO 4 Interrupt (Active LOW / Internal Pullup)     │
│   LED Flashes (GPIO 2) + OLED Screen Updates                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ VIRTUAL AWS CLOUD PIPELINE                                  │
│                                                             │
│   AWS IoT Core (MQTT Topic: 'iot/smart-visitor/counter')    │
│                  ↓                                          │
│   IoT SQL Topic Rule triggers AWS Lambda                    │
│                  ↓                                          │
│   AWS Lambda ('processVisitorCounter' Node.js 20.x)         │
│                  ↓                                          │
│   Amazon DynamoDB (Atomic UpdateItem: ADD visitorCount :1)  │
│                  ↓                                          │
│   Web Dashboard & OLED Display Synchronized                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Project Structure

```text
cloud project 1/
│
├── backend/
│   ├── models/
│   │   └── mockDynamoDB.js          # In-memory DynamoDB store & state
│   ├── services/
│   │   └── awsSimulationService.js  # End-to-end cloud pipeline simulation
│   ├── controllers/
│   │   └── visitorController.js     # REST & Server-Sent Events controller
│   ├── routes/
│   │   └── visitorRoutes.js         # API route endpoints
│   ├── server.js                    # Express.js server (Port 5001)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Audio/
│   │   │   │   └── soundEffects.js         # Web Audio API click/beep synthesizer
│   │   │   ├── CloudArchitecture/
│   │   │   │   └── CloudFlowPanel.jsx      # Animated AWS pipeline & node cards
│   │   │   ├── Dashboard/
│   │   │   │   ├── ControlsBar.jsx         # Push button, Sim engine, Cam controls
│   │   │   │   ├── StatCard.jsx            # KPI telemetry summary cards
│   │   │   │   └── VisitorChart.jsx        # Hourly activity timeline chart
│   │   │   ├── Device3D/
│   │   │   │   ├── Breadboard.jsx          # MB-102 solderless breadboard
│   │   │   │   ├── ComponentLabels.jsx     # Floating 3D annotations
│   │   │   │   ├── DeviceCanvas.jsx        # Three.js Canvas & camera controller
│   │   │   │   ├── ESP32.jsx               # ESP32 DevKit with RF shield & chips
│   │   │   │   ├── JumperWires.jsx         # Curved DuPont jumper cables
│   │   │   │   ├── LabDesk.jsx             # Anti-static ESD workbench
│   │   │   │   ├── LED.jsx                 # 5mm LED with realistic PointLight
│   │   │   │   ├── OledDisplay.jsx         # SSD1306 dynamic canvas OLED screen
│   │   │   │   ├── PushButton.jsx          # Tactile switch with physical travel
│   │   │   │   ├── Resistor.jsx            # 220Ω color-banded axial resistor
│   │   │   │   └── UsbCable.jsx            # Micro-USB cable running off bench
│   │   │   ├── EventLog/
│   │   │   │   └── EventConsole.jsx        # Live technical telemetry terminal
│   │   │   ├── InspectorModal/
│   │   │   │   └── ComponentInspector.jsx  # Technical hardware & cloud inspector
│   │   │   └── Navbar.jsx                  # Header with status pills & audio toggle
│   │   ├── hooks/
│   │   │   └── useVisitorSimulation.js     # Simulation engine & hardware sync hook
│   │   ├── services/
│   │   │   └── api.js                      # Backend API client with offline fallback
│   │   ├── App.jsx                         # Main dashboard layout
│   │   ├── index.css                       # Tailwind & cyber aesthetic styling
│   │   └── main.jsx                        # React root entrypoint
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

---

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm install
npm start
```

The virtual AWS simulation server will start on:
👉 **`http://localhost:5001`**

---

### Step 2: Start the Frontend Application

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The application will launch on:
👉 **`http://localhost:3000`**

---

## 🎮 How to Interact with the Virtual Laboratory

1. **3D Camera Navigation**:
   * **Left Click + Drag**: Orbit / Rotate the 3D device around 360 degrees.
   * **Scroll Wheel**: Zoom in for a close look at the components.
   * **Right Click + Drag**: Pan the camera across the workbench.
   * **Camera Presets**: Click `ISO`, `TOP`, or `FOCUS` on the control bar to quickly snap to preset viewpoints.

2. **Triggering a Visitor Count**:
   * **Option A**: Click the **3D Blue Push Button** directly on the breadboard inside the 3D viewport.
   * **Option B**: Click the large **"PUSH HARDWARE BUTTON"** in the control ribbon.
   * Watch the button physically press down, hear the tactile mechanical click, see the red LED light up, and watch the OLED display update in real time.

3. **Watching the Cloud Pipeline**:
   * Observe the glowing data packet travel across `ESP32` ➔ `AWS IoT Core` ➔ `AWS Lambda` ➔ `Amazon DynamoDB` ➔ `Web Dashboard`.
   * Monitor the **System Telemetry Console** to inspect exact timestamps, GPIO edge detection, MQTT topics, and Lambda execution metrics.

4. **Inspecting Components**:
   * Click on the ESP32, Pushbutton, LED, Resistor, OLED, or any Cloud node card to view comprehensive technical specifications, pinout tables, and firmware/cloud code.

5. **Automated Traffic Simulation**:
   * Click **`[ START SIMULATION ]`** to automatically generate visitors at a customizable interval (1.5s, 3.0s, or 5.0s).
   * Click **`[ RESET ]`** at any time to return the benchmark back to 127 visitors.
#   C l o u d _ p r o j e c t _ 1  
 