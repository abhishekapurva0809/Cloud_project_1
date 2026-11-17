import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function LED({ ledActive, onSelectComponent }) {
  const lensRef = useRef();
  const domeRef = useRef();
  const lightRef = useRef();
  const intensityRef = useRef(0);

  // Smooth analog illumination & phosphor persistence decay
  useFrame((state, delta) => {
    const target = ledActive ? 1.0 : 0.0;
    // Fast rise on activation (~30ms), gentle phosphor decay on turn-off (~250ms)
    const speed = ledActive ? 28 : 7;
    intensityRef.current = THREE.MathUtils.damp(intensityRef.current, target, speed, delta);

    const val = intensityRef.current;

    // Smoothly modulate material emissive intensity
    if (lensRef.current?.material) {
      lensRef.current.material.emissiveIntensity = 0.05 + val * 2.4;
    }
    if (domeRef.current?.material) {
      domeRef.current.material.emissiveIntensity = 0.05 + val * 2.8;
    }

    // Smoothly modulate dynamic Three.js PointLight
    if (lightRef.current) {
      lightRef.current.intensity = val * 3.2;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelectComponent) {
      onSelectComponent({
        title: "5mm Diffused Red Status LED",
        category: "Visual Output Indicator",
        status: ledActive ? "ACTIVE (Illuminated)" : "STANDBY (Off)",
        specs: [
          { label: "Lens Type", value: "5mm Round Diffused Red Epoxy" },
          { label: "Connected Pin", value: "ESP32 GPIO 2 (PWM capable)" },
          { label: "Forward Voltage (Vf)", value: "2.0V DC" },
          { label: "Forward Current (If)", value: "15 mA" },
          { label: "Current-Limiting", value: "220Ω 1/4W Metal Film Resistor" },
          { label: "Luminous Intensity", value: "800 mcd" },
          { label: "Peak Wavelength", value: "625 nm (Red)" },
          { label: "Active Pulse Duration", value: "750 ms per visitor event" }
        ],
        codeSample: `// LED Indication Trigger
digitalWrite(LED_GPIO, HIGH);
delay(750);
digitalWrite(LED_GPIO, LOW);`
      });
    }
  };

  return (
    <group position={[0.8, -0.05, -0.5]} onClick={handleClick} cursor="pointer">
      {/* LED Lens: Base Cylinder */}
      <mesh ref={lensRef} castShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.28, 20]} />
        <meshPhysicalMaterial 
          color="#ff2222"
          roughness={0.15} 
          transmission={0.4}
          thickness={0.5}
          emissive="#ff0000"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* LED Lens: Dome Top */}
      <mesh ref={domeRef} castShadow position={[0, 0.36, 0]}>
        <sphereGeometry args={[0.16, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshPhysicalMaterial 
          color="#ff3333"
          roughness={0.1} 
          transmission={0.45}
          thickness={0.5}
          emissive="#ff0000"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* LED Bottom Lip Rim */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 20]} />
        <meshStandardMaterial 
          color="#7f1d1d" 
          emissive="#ff0000"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Realistic Point Light glow shining onto breadboard with smooth interpolation */}
      <pointLight 
        ref={lightRef}
        position={[0, 0.45, 0]} 
        color="#ff2222" 
        intensity={0} 
        distance={4.2} 
        decay={2}
      />

      {/* Anode & Cathode Metal Leads going into breadboard */}
      <mesh position={[-0.06, 0.01, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.06, 0.01, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}
