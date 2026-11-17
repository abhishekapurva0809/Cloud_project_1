import React from "react";
import { X, Cpu, Copy, Check, ExternalLink, Code } from "lucide-react";

export default function ComponentInspector({ component, onClose, counts, lastEvent }) {
  const [copied, setCopied] = React.useState(false);

  if (!component) return null;

  const handleCopyCode = () => {
    if (component.codeSample) {
      navigator.clipboard.writeText(component.codeSample);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111c35] border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{component.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                  {component.category || "Hardware Component"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{component.status || "Operational"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Technical Specs Grid */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              TECHNICAL SPECIFICATIONS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {component.specs && component.specs.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-[#0a0f1d] border border-slate-800/80 flex flex-col justify-between"
                >
                  <span className="text-[11px] font-mono text-slate-400">{item.label}</span>
                  <span className="text-sm font-mono font-semibold text-cyan-300 mt-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Live Status if DynamoDB or Device */}
          {component.title.includes("DynamoDB") && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 font-mono text-xs space-y-2">
              <div className="text-purple-300 font-bold uppercase tracking-wider">Live DynamoDB Table State</div>
              <div className="flex justify-between text-slate-300">
                <span>Partition Key (deviceId):</span>
                <span className="text-white">ESP32-S3-WROOM-01</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Current Count (visitorCount):</span>
                <span className="text-emerald-400 font-bold">{counts?.current || 128}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Last Updated:</span>
                <span className="text-cyan-300">{lastEvent?.timeFormatted || "Just now"}</span>
              </div>
            </div>
          )}

          {/* Firmware / Code Sample */}
          {component.codeSample && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span>IMPLEMENTATION SNIPPET</span>
                </h4>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy code"}</span>
                </button>
              </div>

              <div className="relative rounded-xl bg-[#080d1a] border border-slate-800 p-3.5 overflow-x-auto">
                <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                  <code>{component.codeSample}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0a0f1d] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Project 1 — Virtual Hardware Demonstration</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
