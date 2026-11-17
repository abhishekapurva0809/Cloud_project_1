import React from "react";
import { 
  Cpu, 
  Wifi, 
  Cloud, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  HelpCircle,
  Settings,
  ExternalLink,
  Radio
} from "lucide-react";
import { isAudioEnabled, toggleAudio } from "./Audio/soundEffects";

export default function Navbar({ 
  device, 
  awsConfig,
  onOpenAwsModal,
  onOpenHelp, 
  soundOn, 
  setSoundOn 
}) {
  const handleToggleSound = () => {
    const newState = toggleAudio();
    setSoundOn(newState);
  };

  const isRealAws = awsConfig?.mode === "REAL" && awsConfig?.hasCredentials;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0e17]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Project Info */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
            <Cpu className="w-5 h-5 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0a0e17] animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                SMART VISITOR COUNTER
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  Project 1
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span>Virtual 3D Hardware Lab</span>
              <span className="text-cyan-500">•</span>
              <span className={isRealAws ? "text-emerald-400 font-semibold" : "text-cyan-400 font-medium"}>
                {isRealAws ? `AWS Cloud Live (${awsConfig.region})` : "Virtual AWS Simulation"}
              </span>
            </p>
          </div>
        </div>

        {/* Telemetry Status Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          {/* Hardware Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">ESP32: ONLINE</span>
          </div>

          {/* WiFi Status */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-500/20">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>WiFi: CONNECTED (-48 dBm)</span>
          </div>

          {/* Interactive AWS Cloud Connection Badge */}
          <button
            type="button"
            onClick={onOpenAwsModal}
            title="Click to configure or test AWS connection"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all shadow-sm ${
              isRealAws
                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-400/50 hover:bg-emerald-900/60 shadow-emerald-900/30"
                : "bg-amber-950/50 text-amber-300 border border-amber-500/40 hover:bg-amber-900/50 shadow-amber-900/20"
            }`}
          >
            <Cloud className={`w-3.5 h-3.5 ${isRealAws ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
            <span>{isRealAws ? `AWS: ${awsConfig.region} (CONNECTED)` : "AWS: SIMULATED (CONNECT)"}</span>
            <Settings className="w-3 h-3 opacity-70 ml-0.5" />
          </button>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={soundOn ? "Mute audio sound effects" : "Enable tactile sound effects"}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Info Modal Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            title="System Architecture & Guide"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
