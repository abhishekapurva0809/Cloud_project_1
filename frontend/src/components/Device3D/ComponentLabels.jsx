import React from "react";
import { Html } from "@react-three/drei";

export default function ComponentLabels({ showLabels, onSelectComponent }) {
  if (!showLabels) return null;

  return (
    <group>
      {/* 1. ESP32 Label */}
      <Html position={[-2.3, 0.85, 0]} center distanceFactor={12}>
        <div 
          onClick={() => onSelectComponent && onSelectComponent({
            title: "ESP32 Development Board",
            category: "Edge IoT Microcontroller",
            status: "Online / Connected",
            specs: [
              { label: "Chipset", value: "Xtensa 32-bit LX6 Dual-Core @ 240MHz" },
              { label: "Role", value: "Reads push button & publishes MQTT events" },
              { label: "GPIO Active", value: "Pin 4 (Button ISR), Pin 2 (LED)" }
            ]
          })}
          className="cursor-pointer select-none bg-slate-900/90 hover:bg-cyan-950 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white px-2.5 py-1 rounded-md text-[11px] font-mono shadow-xl transition-all hover:scale-105 whitespace-nowrap flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">ESP32 Core</span>
        </div>
      </Html>

      {/* 2. Push Button Label */}
      <Html position={[0.8, 0.85, 0.7]} center distanceFactor={12}>
        <div 
          className="cursor-pointer select-none bg-cyan-500 text-black border border-white/50 px-2.5 py-1 rounded-md text-[11px] font-mono shadow-xl transition-all hover:scale-110 whitespace-nowrap flex items-center gap-1.5 font-bold"
        >
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          <span>PUSH BUTTON (CLICK ME!)</span>
        </div>
      </Html>

      {/* 3. Status LED Label */}
      <Html position={[0.8, 0.85, -0.5]} center distanceFactor={12}>
        <div 
          onClick={() => onSelectComponent && onSelectComponent({
            title: "Red Status LED",
            category: "Output Indicator",
            status: "GPIO 2 Active High",
            specs: [
              { label: "Lens", value: "5mm Diffused Red" },
              { label: "Series Resistor", value: "220Ω" }
            ]
          })}
          className="cursor-pointer select-none bg-slate-900/90 hover:bg-rose-950 border border-rose-500/40 text-rose-300 hover:text-white px-2.5 py-1 rounded-md text-[11px] font-mono shadow-xl transition-all hover:scale-105 whitespace-nowrap flex items-center gap-1"
        >
          <span>LED (GPIO 2)</span>
        </div>
      </Html>

      {/* 4. OLED Display Label */}
      <Html position={[2.6, 0.85, 0.1]} center distanceFactor={12}>
        <div 
          onClick={() => onSelectComponent && onSelectComponent({
            title: "SSD1306 OLED Display",
            category: "I2C Screen",
            status: "128x64 Pixels",
            specs: [
              { label: "Bus", value: "I2C (SDA: 21, SCL: 22)" },
              { label: "Refresh Rate", value: "Real-time" }
            ]
          })}
          className="cursor-pointer select-none bg-slate-900/90 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white px-2.5 py-1 rounded-md text-[11px] font-mono shadow-xl transition-all hover:scale-105 whitespace-nowrap flex items-center gap-1"
        >
          <span>OLED 0.96" I2C</span>
        </div>
      </Html>
    </group>
  );
}
