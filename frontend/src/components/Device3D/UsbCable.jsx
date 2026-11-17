import React, { useMemo } from "react";
import * as THREE from "three";

export default function UsbCable() {
  const cableGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.55, 0.17, 0),
      new THREE.Vector3(-0.3, 0.17, 0),
      new THREE.Vector3(0.5, 0.12, 0.2),
      new THREE.Vector3(1.5, 0.05, 0.6),
      new THREE.Vector3(3.0, -0.2, 1.2),
      new THREE.Vector3(5.5, -0.4, 2.0)
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.07, 12, false);
  }, []);

  return (
    <group position={[-2.3, 0.0, 0]}>
      {/* Molded USB Plug Boot (Plugs into ESP32 port) */}
      <mesh castShadow position={[1.9, 0.17, 0]}>
        <boxGeometry args={[0.55, 0.18, 0.32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Strain Relief Boot */}
      <mesh position={[2.22, 0.17, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.18, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Flexible Cable running off desk */}
      <mesh geometry={cableGeometry} castShadow receiveShadow position={[2.4, 0, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
    </group>
  );
}
