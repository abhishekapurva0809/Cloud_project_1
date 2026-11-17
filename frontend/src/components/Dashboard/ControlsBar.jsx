import React from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Hand, 
  Camera, 
  Tag, 
  Zap
} from "lucide-react";

export default function ControlsBar({
  isPressed,
  isProcessing,
  isSimulating,
  simSpeed,
  setSimSpeed,
  onPressButton,
  onToggleSimulation,
  onReset,
  cameraView,
  setCameraView,
  showLabels,
  setShowLabels
}) {
  const handleMainButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onPressButton("MANUAL_UI_TRIGGER");
  };

  return (
    <div className="rounded-xl bg-[#0f172a]/80 backdrop-blur-md border border-cyan-500/20 p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
      {/* Primary Interaction: Click 3D Button */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          type="button"
          onClick={handleMainButtonClick}
          className={`relative group overflow-hidden flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ease-out w-full sm:w-auto select-none shadow-lg active:scale-95 ${
            isPressed
              ? "bg-cyan-400 text-black translate-y-0.5 shadow-cyan-500/60 scale-[0.98]"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]"
          }`}
        >
          {/* Animated glow shimmer */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <Hand className={`w-5 h-5 transition-transform duration-200 ${isPressed ? 'scale-75 -rotate-6' : 'group-hover:-rotate-12'}`} />
          <span className="font-mono uppercase whitespace-nowrap">
            {isPressed ? "CONTACT CLOSED!" : "PUSH HARDWARE BUTTON"}
          </span>
          <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded border border-white/20 font-mono">
            GPIO 4
          </span>
        </button>

        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
            isProcessing ? 'bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400' : 'bg-emerald-400'
          }`} />
          <span>{isProcessing ? 'TX IN-FLIGHT' : 'STANDBY'}</span>
        </div>
      </div>

      {/* Simulation Engine Controls */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between sm:justify-start">
        {/* Play / Pause Auto Simulation */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onToggleSimulation(); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-mono border transition-all duration-200 active:scale-95 ${
            isSimulating
              ? "bg-amber-950/70 text-amber-300 border-amber-500/40 hover:bg-amber-900/60 shadow-lg shadow-amber-500/10"
              : "bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
          }`}
        >
          {isSimulating ? (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>PAUSE SIM</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>START SIMULATION</span>
            </>
          )}
        </button>

        {/* Speed Slider / Presets */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-mono">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Interval:</span>
          <select 
            value={simSpeed}
            onChange={(e) => setSimSpeed(Number(e.target.value))}
            className="bg-slate-800 text-cyan-300 rounded px-1.5 py-0.5 text-xs border border-slate-700 outline-none cursor-pointer"
          >
            <option value={1.5}>1.5s (Fast)</option>
            <option value={3.0}>3.0s (Normal)</option>
            <option value={5.0}>5.0s (Relaxed)</option>
          </select>
        </div>

        {/* Reset Counter Button */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onReset(); }}
          title="Reset counter back to #127"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium bg-slate-800/70 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 transition-all duration-200 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>

        {/* Camera Views Quick Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/70 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-[10px] text-slate-500 px-1 hidden sm:inline">CAM:</span>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setCameraView("isometric"); }}
            className={`px-2 py-1 rounded text-[11px] transition-all duration-200 ${
              cameraView === "isometric" ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            ISO
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setCameraView("top"); }}
            className={`px-2 py-1 rounded text-[11px] transition-all duration-200 ${
              cameraView === "top" ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            TOP
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setCameraView("closeup"); }}
            className={`px-2 py-1 rounded text-[11px] transition-all duration-200 ${
              cameraView === "closeup" ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            FOCUS
          </button>
        </div>

        {/* Toggle 3D Labels */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowLabels(!showLabels); }}
          title="Toggle 3D Component Labels"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200 ${
            showLabels
              ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-sm"
              : "bg-slate-800/70 text-slate-400 border-slate-700"
          }`}
        >
          <Tag className="w-3 h-3" />
          <span className="hidden sm:inline">LABELS</span>
        </button>
      </div>
    </div>
  );
}
