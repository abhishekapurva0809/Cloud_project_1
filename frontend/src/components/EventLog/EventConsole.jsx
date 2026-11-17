import React, { useState, useRef, useEffect } from "react";
import { Terminal, Trash2, ArrowDownCircle, ShieldCheck, Filter } from "lucide-react";

export default function EventConsole({ 
  liveLogs = [], 
  eventHistory = [], 
  onClearLogs 
}) {
  const [activeTab, setActiveTab] = useState("all"); // "all", "cloud", "hardware", "history"
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      // Localized container scroll without affecting document scroll
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [liveLogs, eventHistory, autoScroll]);

  const filteredLogs = liveLogs.filter(log => {
    if (activeTab === "all") return true;
    if (activeTab === "cloud") return ["AWS IoT", "Lambda", "DynamoDB", "Dashboard", "Amazon DynamoDB"].includes(log.source);
    if (activeTab === "hardware") return ["ESP32", "HARDWARE"].includes(log.source);
    return true;
  });

  const getLevelBadge = (level) => {
    switch (level) {
      case "SUCCESS":
        return "text-emerald-400 bg-emerald-950/70 border-emerald-500/30";
      case "EVENT":
        return "text-cyan-400 bg-cyan-950/70 border-cyan-500/30";
      case "WARN":
        return "text-amber-400 bg-amber-950/70 border-amber-500/30";
      default:
        return "text-slate-400 bg-slate-900 border-slate-800";
    }
  };

  return (
    <div className="rounded-xl bg-[#0a0f1d]/90 backdrop-blur-md border border-cyan-500/20 shadow-2xl flex flex-col h-[380px] overflow-hidden transition-all">
      {/* Console Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0e162b] border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            SYSTEM TELEMETRY CONSOLE
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/20">
            STDIO / TLS
          </span>
        </div>

        {/* Tabs and Controls */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activeTab === "all" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hardware")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activeTab === "hardware" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              ESP32
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cloud")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activeTab === "cloud" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              AWS CLOUD
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activeTab === "history" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              VISITORS ({eventHistory.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? "Disable Auto-scroll" : "Enable Auto-scroll"}
            className={`p-1 rounded hover:bg-slate-800 transition-colors ${autoScroll ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body with Discrete Internal Scroll */}
      <div 
        ref={scrollContainerRef}
        style={{ overflowAnchor: "none" }}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 select-text"
      >
        {activeTab === "history" ? (
          /* Visitor Event History Table / List */
          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider pb-1 mb-2 border-b border-slate-800/80 flex justify-between">
              <span>Timestamp & ID</span>
              <span>Source & Trigger</span>
              <span>Cloud Latency</span>
              <span>Status</span>
            </div>
            {eventHistory.length === 0 ? (
              <div className="text-slate-500 italic text-center py-6">No visitor events recorded yet</div>
            ) : (
              eventHistory.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="flex items-center justify-between py-1.5 px-2 rounded bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 text-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">#{item.count}</span>
                    <span className="text-slate-400 text-[11px]">{item.timeFormatted}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    <span className="text-slate-200">{item.trigger === "AUTO_SIMULATION" ? "Auto-Sim" : "3D Button"}</span>
                  </div>
                  <div className="text-cyan-300 text-[11px]">
                    {item.awsLatencyMs || 42}ms
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${
                    item.status === "COMMITTED_AWS" 
                      ? "text-amber-300 bg-amber-950/60 border-amber-500/40" 
                      : "text-emerald-400 bg-emerald-950/60 border-emerald-500/30"
                  }`}>
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>{item.status === "COMMITTED_AWS" ? "REAL DYNAMODB" : "DYNAMODB OK"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Live Stream Logs */
          <>
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 italic text-center py-6">Waiting for hardware telemetry...</div>
            ) : (
              filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-2.5 py-0.5 text-[11px] hover:bg-slate-900/60 px-1 rounded transition-colors"
                >
                  <span className="text-slate-500 select-none whitespace-nowrap">
                    {log.time}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded border text-[10px] whitespace-nowrap font-semibold ${getLevelBadge(log.level)}`}>
                    {log.source}
                  </span>
                  <span className="text-slate-300 break-all leading-relaxed">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-1.5 bg-[#0c1222] border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Active Session: ESP32-S3-WROOM-01</span>
        </div>
        <div className="text-slate-500">
          Showing {filteredLogs.length} events
        </div>
      </div>
    </div>
  );
}
