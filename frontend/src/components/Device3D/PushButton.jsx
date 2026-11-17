import React, { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function PushButton({ 
  isPressed, 
  onPress, 
  onSelectComponent 
}) {
  const [hovered, setHovered] = useState(false);
  const plungerRef = useRef();
  const contactRingRef = useRef();
  
  // Animation state tracking for buttery smooth mechanical motion
  const animTimeRef = useRef(-1); // -1 = idle
  const currentYRef = useRef(0);
  const ringScaleRef = useRef(0);
  const ringOpacityRef = useRef(0);

  // Trigger animation whenever isPressed flips to true
  const prevPressedRef = useRef(false);
  if (isPressed && !prevPressedRef.current) {
    animTimeRef.current = 0;
  }
  prevPressedRef.current = isPressed;

  // Frame loop: continuous mechanical spring physics
  useFrame((state, delta) => {
    // If the parent says isPressed is actively held, target bottom immediately
    if (isPressed) {
      currentYRef.current = THREE.MathUtils.damp(currentYRef.current, -0.095, 24, delta);
      ringScaleRef.current = THREE.MathUtils.damp(ringScaleRef.current, 1.0, 20, delta);
      ringOpacityRef.current = THREE.MathUtils.damp(ringOpacityRef.current, 0.8, 20, delta);
    } else if (animTimeRef.current >= 0) {
      // Deterministic smooth mechanical press cycle (~260ms)
      animTimeRef.current += delta;
      const t = animTimeRef.current;
      const totalDuration = 0.26; // seconds

      if (t < 0.08) {
        // Phase 1: Down stroke (0 to 80ms) - smooth ease-out drop
        const progress = t / 0.08;
        const eased = Math.sin((progress * Math.PI) / 2);
        currentYRef.current = -0.095 * eased;
        ringScaleRef.current = progress;
        ringOpacityRef.current = 0.85 * (1 - progress * 0.3);
      } else if (t < 0.12) {
        // Phase 2: Contact dwell (80 to 120ms) - holding at bottom
        currentYRef.current = -0.095;
        ringScaleRef.current = 1.0 + (t - 0.08) * 2;
        ringOpacityRef.current = 0.6;
      } else if (t < totalDuration) {
        // Phase 3: Spring rebound (120 to 260ms) - spring curve with subtle damped overshoot
        const progress = (t - 0.12) / (totalDuration - 0.12);
        // Damped harmonic oscillation curve: e^(-3p) * cos(5p)
        const spring = Math.cos(progress * Math.PI * 0.5);
        currentYRef.current = -0.095 * spring;
        ringOpacityRef.current = Math.max(0, 0.6 * (1 - progress));
        ringScaleRef.current = 1.0 + progress * 0.8;
      } else {
        // Animation finished
        currentYRef.current = 0;
        animTimeRef.current = -1;
        ringScaleRef.current = 0;
        ringOpacityRef.current = 0;
      }
    } else {
      // Idle resting position
      currentYRef.current = THREE.MathUtils.damp(currentYRef.current, 0, 16, delta);
      ringOpacityRef.current = THREE.MathUtils.damp(ringOpacityRef.current, 0, 16, delta);
    }

    // Apply computed position to 3D plunger mesh
    if (plungerRef.current) {
      plungerRef.current.position.y = currentYRef.current;
    }

    // Apply ripple to contact ring
    if (contactRingRef.current) {
      const s = Math.max(0.1, ringScaleRef.current);
      contactRingRef.current.scale.set(s, s, s);
      if (contactRingRef.current.material) {
        contactRingRef.current.material.opacity = ringOpacityRef.current;
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    // Kick off animation immediately for instant zero-latency feedback
    animTimeRef.current = 0;
    if (onPress) {
      onPress("3D_BUTTON_CLICK");
    }
  };

  return (
    <group 
      position={[0.8, -0.08, 0.7]} 
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* 4-Pin Metal Base Frame */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[0.7, 0.12, 0.7]} />
        <meshStandardMaterial 
          color="#94a3b8" 
          metalness={0.85} 
          roughness={0.25} 
        />
      </mesh>

      {/* 4 Metal Corner Rivets */}
      {[-0.26, 0.26].map(x => 
        [-0.26, 0.26].map(z => (
          <mesh key={`${x}-${z}`} position={[x, 0.12, z]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} />
          </mesh>
        ))
      )}

      {/* Raised circular metallic collar */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.06, 24]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Interactive Plunger (Actuator that pushes down smoothly) */}
      <group ref={plungerRef} position={[0, 0, 0]}>
        {/* Plunger Cap (Vibrant Tactile Blue) */}
        <mesh castShadow position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.2, 0.22, 0.2, 24]} />
          <meshStandardMaterial 
            color={hovered ? "#06b6d4" : "#0284c7"} 
            roughness={0.28} 
            metalness={0.15}
            emissive={hovered ? "#06b6d4" : "#003b5c"}
            emissiveIntensity={hovered ? 0.45 : 0.08}
          />
        </mesh>
        {/* Top convex button crown */}
        <mesh position={[0, 0.34, 0]}>
          <sphereGeometry args={[0.19, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          <meshStandardMaterial 
            color={hovered ? "#38bdf8" : "#0ea5e9"} 
            roughness={0.22}
            emissive={hovered ? "#38bdf8" : "#0284c7"}
            emissiveIntensity={hovered ? 0.4 : 0.1}
          />
        </mesh>
      </group>

      {/* Dynamic Tactile Contact Wave Ripple on Press */}
      <mesh ref={contactRingRef} position={[0, 0.135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.27, 0.38, 32]} />
        <meshBasicMaterial 
          color="#38bdf8" 
          transparent 
          opacity={0} 
          side={THREE.DoubleSide} 
          depthWrite={false}
        />
      </mesh>

      {/* Hover Ambient Ring Indicator */}
      {hovered && (
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.46, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 4 Breadboard Contact Legs inserting into holes */}
      {[-0.32, 0.32].map(x => (
        <group key={x}>
          <mesh position={[x, -0.06, 0.22]}>
            <boxGeometry args={[0.04, 0.18, 0.04]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
          <mesh position={[x, -0.06, -0.22]}>
            <boxGeometry args={[0.04, 0.18, 0.04]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
