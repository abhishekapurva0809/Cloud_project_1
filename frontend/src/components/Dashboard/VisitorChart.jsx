import React from "react";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export default function VisitorChart({ hourlyStats = [] }) {
  const maxVisitors = Math.max(...hourlyStats.map(s => s.visitors), 50);
  const totalInChart = hourlyStats.reduce((sum, s) => sum + s.visitors, 0);

  return (
    <div className="rounded-xl bg-[#0f172a]/75 backdrop-blur-md border border-cyan-500/20 p-4 sm:p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              VISITOR ACTIVITY TIMELINE
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                HOURLY TELEMETRY
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              DynamoDB Time-Series Aggregation (Simulated)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Today's Total:</span>
            <span className="font-bold text-cyan-300">{totalInChart}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-slate-400">Peak:</span>
            <span className="font-bold">{maxVisitors}/hr</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart with smooth animations */}
      <div className="relative pt-6 pb-2">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-cyan-400 border-dashed w-full" />
          <div className="border-b border-slate-600 border-dashed w-full" />
          <div className="border-b border-slate-600 border-dashed w-full" />
          <div className="border-b border-slate-700 w-full" />
        </div>

        {/* Bars Container */}
        <div className="relative flex items-end justify-between gap-1 sm:gap-2 h-44 px-2">
          {hourlyStats.map((item, index) => {
            const heightPercent = Math.min(100, Math.max(12, Math.round((item.visitors / maxVisitors) * 100)));
            const isPeak = item.visitors === maxVisitors;

            return (
              <div 
                key={index} 
                className="group relative flex-1 flex flex-col items-center h-full justify-end"
              >
                {/* Floating Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 bg-slate-900/95 border border-cyan-500/40 text-cyan-300 px-2.5 py-1 rounded-md text-[11px] font-mono shadow-xl whitespace-nowrap">
                  <span className="font-bold">{item.visitors}</span> visitors at {item.time}
                </div>

                {/* Visitor Number above bar */}
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 mb-1 transition-colors">
                  {item.visitors}
                </span>

                {/* Animated Bar */}
                <div 
                  className={`w-full max-w-[34px] rounded-t-md transition-all duration-500 relative overflow-hidden ${
                    isPeak 
                      ? "bg-gradient-to-t from-cyan-600 via-cyan-400 to-emerald-300 shadow-lg shadow-cyan-500/25" 
                      : "bg-gradient-to-t from-slate-700 via-cyan-900/80 to-cyan-500/60 group-hover:from-cyan-700 group-hover:to-cyan-400"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Subtle highlight sheen */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-white/40" />
                </div>

                {/* Hour label */}
                <span className="mt-2 text-[9px] sm:text-[10px] font-mono text-slate-400 truncate max-w-full text-center">
                  {item.time.replace(":00", "")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
