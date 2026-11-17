import React from "react";

export default function LabDesk() {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Workbench surface */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[14, 0.4, 10]} />
        <meshStandardMaterial 
          color="#0f172a" 
          roughness={0.65} 
          metalness={0.25} 
        />
      </mesh>

      {/* Anti-static ESD Rubber Lab Mat (Dark Navy / Grey with grid) */}
      <mesh receiveShadow position={[0, 0.21, 0]}>
        <boxGeometry args={[11, 0.02, 7.5]} />
        <meshStandardMaterial 
          color="#1e293b" 
          roughness={0.8} 
          metalness={0.1} 
        />
      </mesh>

      {/* Mat Beveled Border Trim */}
      <mesh position={[0, 0.22, 3.7]}>
        <boxGeometry args={[11, 0.01, 0.08]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.22, -3.7]}>
        <boxGeometry args={[11, 0.01, 0.08]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[5.45, 0.22, 0]}>
        <boxGeometry args={[0.08, 0.01, 7.4]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-5.45, 0.22, 0]}>
        <boxGeometry args={[0.08, 0.01, 7.4]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.2} />
      </mesh>

      {/* ESD Grounding Terminal Stud */}
      <mesh position={[-5, 0.24, -3.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}
