import React, { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";

export default function OledDisplay({ count = 127, isProcessing, onSelectComponent }) {
  const canvasRef = useRef(document.createElement("canvas"));
  const prevCountRef = useRef(count);
  const flashAlphaRef = useRef(0);

  const oledTexture = useMemo(() => {
    const canvas = canvasRef.current;
    canvas.width = 512;
    canvas.height = 256;
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }, []);

  // Update canvas texture whenever count or status changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear background (Deep OLED black)
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, 512, 256);

    // Top Header Banner (Yellow OLED sector on 0.96" dual color modules)
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 24px monospace";
    ctx.fillText("SMART VISITOR", 24, 38);

    // WiFi signal bars
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(440, 28, 6, 12);
    ctx.fillRect(452, 22, 6, 18);
    ctx.fillRect(464, 16, 6, 24);

    // Divider line
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 52);
    ctx.lineTo(492, 52);
    ctx.stroke();

    // Check if count just incremented for a subtle highlight flash
    const countChanged = prevCountRef.current !== count;
    prevCountRef.current = count;

    // Main Counter Display (Bright Cyan OLED sector)
    ctx.fillStyle = countChanged ? "#ffffff" : isProcessing ? "#38bdf8" : "#00f2fe";
    ctx.font = "bold 96px 'Fira Code', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${count}`, 256, 150);

    // Subtitle label
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 26px monospace";
    ctx.fillText("VISITORS", 256, 195);

    // Bottom telemetry bar
    ctx.fillStyle = "#64748b";
    ctx.font = "18px monospace";
    ctx.fillText(isProcessing ? "● TX MQTT..." : "● AWS IoT: OK", 256, 235);

    // Scanline simulation
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    for (let y = 0; y < 256; y += 4) {
      ctx.fillRect(0, y, 512, 2);
    }

    if (oledTexture) {
      oledTexture.needsUpdate = true;
    }
  }, [count, isProcessing, oledTexture]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelectComponent) {
      onSelectComponent({
        title: "SSD1306 0.96\" I2C OLED Display (128x64)",
        category: "Visual Hardware Output",
        status: `Active / Rendering Count: ${count}`,
        specs: [
          { label: "Screen Size", value: "0.96 inch Diagonal OLED" },
          { label: "Resolution", value: "128 x 64 pixels (Dual Color: Yellow/Blue)" },
          { label: "Driver IC", value: "SSD1306" },
          { label: "Interface Bus", value: "I2C (Address: 0x3C)" },
          { label: "Pinout", value: "GND, VCC (3.3V), SCL (GPIO 22), SDA (GPIO 21)" },
          { label: "Viewing Angle", value: "> 160 degrees" },
          { label: "Power Draw", value: "0.04W typical (Ultra-low power)" }
        ],
        codeSample: `// SSD1306 Adafruit OLED Display Refresh
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void updateOledCount(int count) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 0);
  display.println("SMART VISITOR");
  display.setTextSize(3);
  display.setCursor(35, 20);
  display.println(count);
  display.setTextSize(1);
  display.setCursor(38, 52);
  display.println("VISITORS");
  display.display();
}`
      });
    }
  };

  return (
    <group position={[2.6, 0.05, 0.1]} onClick={handleClick} cursor="pointer">
      {/* Breakout PCB (Blue Soldermask) */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[2.0, 0.08, 1.8]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* 4 Pin Header on PCB top (GND, VCC, SCL, SDA) */}
      <mesh position={[0, 0.12, -0.8]}>
        <boxGeometry args={[0.9, 0.12, 0.12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* Glass OLED Panel Display */}
      <mesh castShadow position={[0, 0.12, 0.05]}>
        <boxGeometry args={[1.7, 0.06, 1.4]} />
        <meshStandardMaterial 
          map={oledTexture} 
          roughness={0.2} 
          metalness={0.1}
          emissive="#00f2fe"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Glass Panel Bezel Border */}
      <mesh position={[0, 0.12, 0.05]}>
        <boxGeometry args={[1.74, 0.055, 1.44]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* OLED Glowing Face Light */}
      <pointLight 
        position={[0, 0.3, 0.05]} 
        color="#00f2fe" 
        intensity={0.6} 
        distance={2.0} 
        decay={2}
      />

      {/* Pins entering breadboard */}
      <mesh position={[0, -0.15, -0.8]}>
        <boxGeometry args={[0.85, 0.25, 0.06]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
    </group>
  );
}
