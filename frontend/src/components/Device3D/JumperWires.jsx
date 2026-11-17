import React, { useMemo } from "react";
import * as THREE from "three";

function JumperWire({ points, color, radius = 0.035 }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(...p))
    );
    return new THREE.TubeGeometry(curve, 32, radius, 8, false);
  }, [points, radius]);

  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  return (
    <group>
      {/* Curved Flexible Wire */}
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial 
          color={color} 
          roughness={0.4} 
          metalness={0.15} 
        />
      </mesh>

      {/* DuPont Connector Plugs (Black plastic boots) at both ends */}
      <mesh position={startPoint}>
        <boxGeometry args={[0.09, 0.18, 0.09]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
      <mesh position={endPoint}>
        <boxGeometry args={[0.09, 0.18, 0.09]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function JumperWires({ onSelectComponent }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelectComponent) {
      onSelectComponent({
        title: "DuPont Jumper Wires & Breadboard Connections",
        category: "Interconnect Hardware",
        status: "Active Signal & Power Routing",
        specs: [
          { label: "Wire Gauge", value: "28 AWG Multi-strand Copper" },
          { label: "Connectors", value: "Male-to-Male (2.54mm DuPont header crimps)" },
          { label: "Red Wire", value: "3.3V DC Power Bus (ESP32 3V3 → Breadboard Rail)" },
          { label: "Black Wire", value: "GND Ground Return (ESP32 GND → Breadboard Rail)" },
          { label: "Yellow Wire", value: "Pushbutton GPIO 4 Trigger line" },
          { label: "Green Wire", value: "LED GPIO 2 Control line" },
          { label: "Blue & Orange", value: "I2C SDA (GPIO 21) & SCL (GPIO 22) Bus lines" }
        ],
        codeSample: `// Breadboard Pinout Reference:
// GPIO 4 -> Tactile Switch (Input Pullup)
// GPIO 2 -> Status LED (Active High)
// GPIO 21 -> OLED SDA
// GPIO 22 -> OLED SCL`
      });
    }
  };

  return (
    <group onClick={handleClick} cursor="pointer">
      {/* 1. Yellow Wire: Button Pin -> ESP32 GPIO 4 */}
      <JumperWire 
        color="#eab308" 
        points={[
          [0.8, -0.05, 0.35],
          [0.3, 0.65, 0.6],
          [-0.6, 0.75, 0.8],
          [-1.5, -0.05, 0.85]
        ]}
      />

      {/* 2. Green Wire: LED Pin -> ESP32 GPIO 2 */}
      <JumperWire 
        color="#22c55e" 
        points={[
          [0.74, -0.05, -0.5],
          [0.0, 0.6, -0.7],
          [-0.8, 0.7, -0.85],
          [-1.8, -0.05, -0.85]
        ]}
      />

      {/* 3. Red Wire: 3.3V Power Rail -> ESP32 3V3 */}
      <JumperWire 
        color="#ef4444" 
        points={[
          [-1.0, -0.05, 1.8],
          [-1.2, 0.55, 1.4],
          [-2.0, 0.5, 1.1],
          [-2.8, -0.05, 0.85]
        ]}
      />

      {/* 4. Black Wire: Ground Rail -> ESP32 GND */}
      <JumperWire 
        color="#1f2937" 
        points={[
          [-1.0, -0.05, -1.8],
          [-1.3, 0.55, -1.4],
          [-2.1, 0.5, -1.1],
          [-2.8, -0.05, -0.85]
        ]}
      />

      {/* 5. Blue Wire: OLED SDA -> ESP32 GPIO 21 */}
      <JumperWire 
        color="#3b82f6" 
        points={[
          [2.3, -0.05, -0.7],
          [1.5, 0.8, -0.2],
          [0.4, 0.9, 0.5],
          [-1.0, -0.05, 0.85]
        ]}
      />

      {/* 6. Orange Wire: OLED SCL -> ESP32 GPIO 22 */}
      <JumperWire 
        color="#f97316" 
        points={[
          [2.5, -0.05, -0.7],
          [1.7, 0.7, -0.1],
          [0.5, 0.8, 0.4],
          [-0.7, -0.05, 0.85]
        ]}
      />

      {/* 7. Black Wire: Resistor Cathode -> Ground Rail */}
      <JumperWire 
        color="#111827" 
        radius={0.025}
        points={[
          [0.8, -0.05, -1.1],
          [0.8, 0.25, -1.4],
          [0.5, 0.2, -1.7],
          [0.2, -0.05, -1.8]
        ]}
      />
    </group>
  );
}
