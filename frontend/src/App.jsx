import React, { useState } from "react";
import Navbar from "./components/Navbar";
import StatCard from "./components/Dashboard/StatCard";
import ControlsBar from "./components/Dashboard/ControlsBar";
import VisitorChart from "./components/Dashboard/VisitorChart";
import DeviceCanvas from "./components/Device3D/DeviceCanvas";
import CloudFlowPanel from "./components/CloudArchitecture/CloudFlowPanel";
import EventConsole from "./components/EventLog/EventConsole";
import ComponentInspector from "./components/InspectorModal/ComponentInspector";
import CloudSettingsModal from "./components/CloudSettingsModal/CloudSettingsModal";
import { useVisitorSimulation } from "./hooks/useVisitorSimulation";
import { 
  Users, 
  Calendar, 
  Layers, 
  Clock, 
  Activity, 
  Wifi, 
  Cpu, 
  Cloud, 
  ShieldCheck, 
  HelpCircle,
  X,
  BookOpen
} from "lucide-react";

export default function App() {
  const {
    counts,
    device,
    awsConfig,
    reloadAwsConfig,
    isPressed,
    ledActive,
    cloudActiveStep,
    pipelineProgress,
    lastEvent,
    eventHistory,
    liveLogs,
    hourlyStats,
    isSimulating,
    simSpeed,
    setSimSpeed,
    inspectedComponent,
    setInspectedComponent,
    isProcessing,
    triggerButtonPress,
    toggleSimulation,
    handleReset
  } = useVisitorSimulation();

  const [cameraView, setCameraView] = useState("isometric");
  const [showLabels, setShowLabels] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAwsModal, setShowAwsModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar 
        device={device}
        awsConfig={awsConfig}
        onOpenAwsModal={() => setShowAwsModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Top KPI Metrics Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Current Visitors"
            value={counts.current}
            subtitle="Real-time Counter"
            icon={Users}
            badge="LIVE SYNC"
            color="cyan"
          />

          <StatCard
            title="Today's Count"
            value={counts.today}
            subtitle="Accumulated Today"
            icon={Calendar}
            badge="RESET 00:00"
            color="emerald"
          />

          <StatCard
            title="Total Visitors"
            value={counts.total.toLocaleString()}
            subtitle="All-time Historical"
            icon={Layers}
            badge="DYNAMODB STORE"
            color="blue"
          />

          <StatCard
            title="Last Event"
            value={lastEvent.timeFormatted}
            subtitle={lastEvent.description}
            icon={Clock}
            badge="VERIFIED"
            color="purple"
          />
        </section>

        {/* Laboratory Controls & Action Ribbon */}
        <section>
          <ControlsBar
            isPressed={isPressed}
            isProcessing={isProcessing}
            isSimulating={isSimulating}
            simSpeed={simSpeed}
            setSimSpeed={setSimSpeed}
            onPressButton={triggerButtonPress}
            onToggleSimulation={toggleSimulation}
            onReset={handleReset}
            cameraView={cameraView}
            setCameraView={setCameraView}
            showLabels={showLabels}
            setShowLabels={setShowLabels}
          />
        </section>

        {/* Center Grid: 3D Virtual Device + Cloud Architecture & Live Logs */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: 3D Hardware Canvas (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <DeviceCanvas
              count={counts.current}
              isPressed={isPressed}
              ledActive={ledActive}
              isProcessing={isProcessing}
              onPressButton={triggerButtonPress}
              onSelectComponent={setInspectedComponent}
              cameraView={cameraView}
              showLabels={showLabels}
            />

            {/* Quick Hardware Pinout Guide */}
            <div className="rounded-xl bg-[#0f172a]/60 backdrop-blur-md border border-slate-800 p-3.5 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-semibold">Active Wiring:</span>
                <span>GPIO 4 (Button) • GPIO 2 (LED) • I2C (OLED 0x3C)</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Physical Hardware Required</span>
              </div>
            </div>
          </div>

          {/* Right Column: Cloud Pipeline & Live Console (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Cloud Architecture Flow */}
            <CloudFlowPanel
              cloudActiveStep={cloudActiveStep}
              pipelineProgress={pipelineProgress}
              awsConfig={awsConfig}
              onSelectComponent={setInspectedComponent}
            />

            {/* Live Telemetry Terminal */}
            <EventConsole
              liveLogs={liveLogs}
              eventHistory={eventHistory}
            />
          </div>

        </section>

        {/* Bottom Section: Visitor Activity Chart */}
        <section>
          <VisitorChart hourlyStats={hourlyStats} />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b13] py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Project 1 — Smart Visitor Counter (Virtual 3D Demonstration)</span>
          <span className="text-cyan-400/80">ESP32 • AWS IoT Core • Lambda • DynamoDB • S3</span>
        </div>
      </footer>

      {/* Component Inspector Modal (Opens on clicking 3D or Cloud parts) */}
      <ComponentInspector
        component={inspectedComponent}
        onClose={() => setInspectedComponent(null)}
        counts={counts}
        lastEvent={lastEvent}
      />

      {/* System Overview / Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Project 1: Smart Visitor Counter — System Guide</span>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              <p>
                This demonstration presents a complete <strong>Virtual 3D Simulation</strong> of an IoT Smart Visitor Counter. No physical breadboard, wires, or ESP32 are needed!
              </p>

              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-1.5">
                <div className="text-cyan-300 font-bold">End-to-End Execution Flow:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li><strong>User Clicks 3D Push Button</strong>: Plunger moves physically downward; audio contact click is synthesized.</li>
                  <li><strong>ESP32 Interrupt</strong>: Detects falling edge on GPIO 4, flashes LED (GPIO 2) for 750ms.</li>
                  <li><strong>AWS IoT Core</strong>: Publishes MQTT message to topic <code className="text-cyan-300">iot/smart-visitor/counter</code>.</li>
                  <li><strong>AWS Lambda</strong>: Triggered via IoT Topic Rule to parse payload and log telemetry.</li>
                  <li><strong>Amazon DynamoDB</strong>: Atomic <code className="text-cyan-300">UpdateItem</code> increments table count without race conditions.</li>
                  <li><strong>Web Dashboard & OLED</strong>: Real-time update refreshes the 3D OLED screen and dashboard analytics!</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200">
                <strong>Virtual AWS Environment:</strong> The cloud pipeline behavior is simulated accurately with realistic request IDs, timestamps, and network latencies.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors"
              >
                Got It, Return to Lab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real AWS Cloud Settings Modal */}
      <CloudSettingsModal
        isOpen={showAwsModal}
        onClose={() => setShowAwsModal(false)}
        onConfigUpdated={() => reloadAwsConfig()}
      />

    </div>
  );
}
