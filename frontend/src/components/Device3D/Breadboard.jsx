import React, { useMemo } from "react";
import * as THREE from "three";

export default function Breadboard({ onSelectComponent }) {
  // Generate crisp breadboard texture with power rails and pin-hole grid
  const breadboardTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Base background (off-white plastic)
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle edge bevel
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 1016, 504);

    // Top power rails
    // Red line (+)
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.lineTo(984, 40);
    ctx.stroke();

    // Blue line (-)
    ctx.strokeStyle = "#3b82f6";
    ctx.beginPath();
    ctx.moveTo(40, 75);
    ctx.lineTo(984, 75);
    ctx.stroke();

    // Bottom power rails
    // Red line (+)
    ctx.strokeStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(40, 437);
    ctx.lineTo(984, 437);
    ctx.stroke();

    // Blue line (-)
    ctx.strokeStyle = "#3b82f6";
    ctx.beginPath();
    ctx.moveTo(40, 472);
    ctx.lineTo(984, 472);
    ctx.stroke();

    // Labels '+' and '-'
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#ef4444";
    ctx.fillText("+", 20, 46);
    ctx.fillText("+", 992, 46);
    ctx.fillText("+", 20, 443);
    ctx.fillText("+", 992, 443);

    ctx.fillStyle = "#3b82f6";
    ctx.fillText("-", 20, 80);
    ctx.fillText("-", 992, 80);
    ctx.fillText("-", 20, 476);
    ctx.fillText("-", 992, 476);

    // Center divider groove
    ctx.fillStyle = "#9ca3af";
    ctx.fillRect(30, 252, 964, 8);

    // Draw pin-hole grid
    const cols = 30;
    const startX = 65;
    const stepX = (960 - startX) / (cols - 1);

    // Power rail holes
    const powerRows = [40, 75, 437, 472];
    ctx.fillStyle = "#111827";
    powerRows.forEach(y => {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * stepX;
        ctx.fillRect(x - 3, y - 3, 6, 6);
      }
    });

    // Terminal strip rows: Top bank (A-E)
    const topRows = [120, 145, 170, 195, 220];
    topRows.forEach(y => {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * stepX;
        ctx.fillRect(x - 3.5, y - 3.5, 7, 7);
      }
    });

    // Terminal strip rows: Bottom bank (F-J)
    const bottomRows = [292, 317, 342, 367, 392];
    bottomRows.forEach(y => {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * stepX;
        ctx.fillRect(x - 3.5, y - 3.5, 7, 7);
      }
    });

    // Silk screen labels for columns (1, 5, 10, 15, 20, 25, 30)
    ctx.font = "bold 13px monospace";
    ctx.fillStyle = "#6b7280";
    for (let c = 0; c < cols; c++) {
      if ((c + 1) % 5 === 0 || c === 0) {
        const x = startX + c * stepX;
        ctx.fillText(`${c + 1}`, x - 7, 105);
        ctx.fillText(`${c + 1}`, x - 7, 415);
      }
    }

    // Row letters A-E and F-J
    const lettersTop = ["A", "B", "C", "D", "E"];
    lettersTop.forEach((ltr, i) => {
      ctx.fillText(ltr, 42, topRows[i] + 4);
      ctx.fillText(ltr, 968, topRows[i] + 4);
    });
    const lettersBottom = ["F", "G", "H", "I", "J"];
    lettersBottom.forEach((ltr, i) => {
      ctx.fillText(ltr, 42, bottomRows[i] + 4);
      ctx.fillText(ltr, 968, bottomRows[i] + 4);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelectComponent) {
      onSelectComponent({
        title: "Solderless Breadboard (MB-102 Half-Size)",
        category: "Prototyping Platform",
        status: "Active Circuit Platform",
        specs: [
          { label: "Tie Points", value: "400 Points (300 Terminal + 100 Power)" },
          { label: "Pitch", value: "2.54mm (0.1 inch standard DIP)" },
          { label: "Power Distribution", value: "Dual ± Rails (3.3V / GND)" },
          { label: "Spring Clips", value: "Nickel-plated phosphor bronze" },
          { label: "Housing Material", value: "ABS plastic with self-adhesive backing" },
          { label: "Rating", value: "300V / 3A max" }
        ],
        codeSample: `// Breadboard Distribution Schematic:
// 1. ESP32 3V3 -> Red Power Rail (+)
// 2. ESP32 GND -> Blue Ground Rail (-)
// 3. Tactile Button -> Straddles center divider (Pin 4 to Rail)
// 4. Red LED -> GPIO 2 via 220Ω current limiting resistor`
      });
    }
  };

  return (
    <group position={[0, -0.3, 0]} onClick={handleClick}>
      {/* Breadboard Base Box */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[8.5, 0.35, 4.2]} />
        <meshStandardMaterial 
          map={breadboardTexture} 
          roughness={0.7} 
          metalness={0.05} 
        />
      </mesh>

      {/* Breadboard Bottom Foam/Adhesive Layer */}
      <mesh position={[0, -0.19, 0]}>
        <boxGeometry args={[8.52, 0.04, 4.22]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>

      {/* Interlocking tabs on breadboard edges */}
      <mesh position={[-4.3, -0.05, 0]}>
        <boxGeometry args={[0.1, 0.15, 0.6]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[4.3, -0.05, 0]}>
        <boxGeometry args={[0.1, 0.15, 0.6]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
    </group>
  );
}
