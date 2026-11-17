import React from "react";

export default function Resistor({ onSelectComponent }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelectComponent) {
      onSelectComponent({
        title: "220Ω 1/4W Current-Limiting Resistor",
        category: "Passive Component",
        status: "Operational in Series with LED",
        specs: [
          { label: "Resistance", value: "220 Ohms (Ω) ± 5%" },
          { label: "Power Rating", value: "0.25 Watt (1/4 W)" },
          { label: "Color Bands", value: "Red - Red - Brown - Gold" },
          { label: "Formula Used", value: "R = (Vsupply - Vf) / If = (3.3V - 2.0V) / 0.015A ≈ 86.6Ω → 220Ω chosen for safety" },
          { label: "Package", value: "Axial Through-Hole (DO-35)" },
          { label: "Lead Diameter", value: "0.5 mm Tinned Copper" }
        ],
        codeSample: `// Resistor calculation Ohm's Law:
// I_led = (V_esp32_gpio - V_led_drop) / R
// I_led = (3.3V - 2.0V) / 220Ω = 5.9 mA safe operating current`
      });
    }
  };

  return (
    <group position={[0.8, -0.06, -0.9]} onClick={handleClick} cursor="pointer">
      {/* Resistor Ceramic Body */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.45, 16]} />
        <meshStandardMaterial color="#e2d9c8" roughness={0.6} />
      </mesh>

      {/* Resistor Color Bands */}
      {/* Band 1: Red */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.14, 0.14, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.04, 16]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* Band 2: Red */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.06, 0.14, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.04, 16]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* Band 3: Brown (multiplier x10) */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.02, 0.14, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.04, 16]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Band 4: Gold (tolerance 5%) */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.13, 0.14, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.04, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Bent Axial Wire Leads */}
      {/* Left bent lead */}
      <mesh position={[-0.26, 0.07, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Right bent lead */}
      <mesh position={[0.26, 0.07, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}
