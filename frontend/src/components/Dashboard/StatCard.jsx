import React from "react";

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  badge, 
  color = "cyan",
  onClick 
}) {
  const colorMap = {
    cyan: {
      border: "border-cyan-500/20 hover:border-cyan-500/40",
      glow: "hover:shadow-cyan-500/10",
      iconBg: "bg-cyan-950/60 text-cyan-400 border-cyan-500/30",
      accent: "text-cyan-400",
      badge: "bg-cyan-950 text-cyan-300 border-cyan-500/30"
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      glow: "hover:shadow-emerald-500/10",
      iconBg: "bg-emerald-950/60 text-emerald-400 border-emerald-500/30",
      accent: "text-emerald-400",
      badge: "bg-emerald-950 text-emerald-300 border-emerald-500/30"
    },
    blue: {
      border: "border-blue-500/20 hover:border-blue-500/40",
      glow: "hover:shadow-blue-500/10",
      iconBg: "bg-blue-950/60 text-blue-400 border-blue-500/30",
      accent: "text-blue-400",
      badge: "bg-blue-950 text-blue-300 border-blue-500/30"
    },
    purple: {
      border: "border-purple-500/20 hover:border-purple-500/40",
      glow: "hover:shadow-purple-500/10",
      iconBg: "bg-purple-950/60 text-purple-400 border-purple-500/30",
      accent: "text-purple-400",
      badge: "bg-purple-950 text-purple-300 border-purple-500/30"
    }
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-[#0f172a]/70 backdrop-blur-md border ${scheme.border} p-4 transition-all duration-200 shadow-lg min-h-[124px] flex flex-col justify-between ${scheme.glow} ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    >
      {/* Background ambient gradient */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 truncate">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {value}
            </h3>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[140px] sm:max-w-[180px]">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-2 rounded-xl border ${scheme.iconBg} shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
          <span className={`inline-block px-2 py-0.5 text-[9px] font-semibold uppercase rounded-md border ${scheme.badge}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}
