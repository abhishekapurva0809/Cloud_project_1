import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

import LabDesk from "./LabDesk";
import Breadboard from "./Breadboard";
import ESP32 from "./ESP32";
import PushButton from "./PushButton";
import LED from "./LED";
import Resistor from "./Resistor";
import OledDisplay from "./OledDisplay";
import JumperWires from "./JumperWires";
import UsbCable from "./UsbCable";
import ComponentLabels from "./ComponentLabels";

// Smooth Cinematic Camera Controller with Zoom Commands & Presets
function CameraController({ 
  cameraView, 
  zoomSignal, 
  onZoomApplied,
  onDistanceChange
}) {
  const controlsRef = useRef();
  const { camera } = useThree();

  // Preset definitions
  const presets = useMemo(() => ({
    isometric: {
      position: new THREE.Vector3(4.8, 6.2, 7.2),
      target: new THREE.Vector3(0, 0, 0)
    },
    top: {
      position: new THREE.Vector3(0.01, 9.8, 0.01),
      target: new THREE.Vector3(0, 0, 0)
    },
    closeup: {
      position: new THREE.Vector3(1.6, 2.9, 2.9),
      target: new THREE.Vector3(0.8, -0.05, 0.6)
    }
  }), []);

  // Internal targets that the camera damps towards
  const desiredPosRef = useRef(new THREE.Vector3(4.8, 6.2, 7.2));
  const desiredTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  // When cameraView preset changes, update desired targets
  useEffect(() => {
    const active = presets[cameraView] || presets.isometric;
    desiredPosRef.current.copy(active.position);
    desiredTargetRef.current.copy(active.target);
  }, [cameraView, presets]);

  // Handle zoom signals strictly from Zoom In (+) / Zoom Out (-) buttons
  useEffect(() => {
    if (!zoomSignal) return;
    const target = desiredTargetRef.current;
    const currentPos = desiredPosRef.current;
    const offset = currentPos.clone().sub(target);
    const dist = offset.length();

    if (zoomSignal.type === "IN") {
      // Zoom In: move 25% closer (clamped at min 3.2 units)
      const newDist = Math.max(3.2, dist * 0.75);
      offset.setLength(newDist);
      desiredPosRef.current.copy(target).add(offset);
    } else if (zoomSignal.type === "OUT") {
      // Zoom Out: move 30% farther away (clamped at max 14.0 units)
      const newDist = Math.min(14.0, dist * 1.30);
      offset.setLength(newDist);
      desiredPosRef.current.copy(target).add(offset);
    } else if (zoomSignal.type === "RESET") {
      // Reset back to preset distance
      const active = presets[cameraView] || presets.isometric;
      desiredPosRef.current.copy(active.position);
      desiredTargetRef.current.copy(active.target);
    }

    if (onZoomApplied) {
      onZoomApplied();
    }
  }, [zoomSignal, cameraView, presets, onZoomApplied]);

  // Frame interpolation: smoothly glide camera position & lookAt target
  useFrame((state, delta) => {
    if (controlsRef.current) {
      const target = desiredTargetRef.current;
      const desiredPos = desiredPosRef.current;

      // Smoothly damp OrbitControls target look-at point
      controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, target.x, 7, delta);
      controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, target.y, 7, delta);
      controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, target.z, 7, delta);

      // Smoothly damp Camera 3D position
      camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPos.x, 7, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPos.y, 7, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.z, 7, delta);

      controlsRef.current.update();

      // Report current distance for HUD display
      if (onDistanceChange) {
        const curDist = camera.position.distanceTo(controlsRef.current.target);
        onDistanceChange(curDist);
      }
    }
  });

  // Keep desired target in sync if user manually orbits with mouse
  const handleControlsStart = () => {
    if (controlsRef.current) {
      desiredPosRef.current.copy(camera.position);
      desiredTargetRef.current.copy(controlsRef.current.target);
    }
  };

  const handleControlsEnd = () => {
    if (controlsRef.current) {
      desiredPosRef.current.copy(camera.position);
      desiredTargetRef.current.copy(controlsRef.current.target);
    }
  };

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      enableZoom={false} /* 🔒 ZOOM DISABLED FOR MOUSE SCROLL - ONLY WORKS VIA BUTTONS */
      minDistance={3.2}
      maxDistance={14.0}
      maxPolarAngle={Math.PI / 2 - 0.05}
      onStart={handleControlsStart}
      onEnd={handleControlsEnd}
    />
  );
}

export default function DeviceCanvas({
  count = 127,
  isPressed = false,
  ledActive = false,
  isProcessing = false,
  onPressButton,
  onSelectComponent,
  cameraView = "isometric",
  showLabels = true
}) {
  const [zoomSignal, setZoomSignal] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(11.0);

  // Compute normalized zoom percentage (100% = default ~10.5 distance)
  const zoomPercent = Math.round(Math.min(220, Math.max(40, (10.5 / (currentDistance || 10.5)) * 100)));

  const handleZoomIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setZoomSignal({ type: "IN", id: Date.now() });
  };

  const handleZoomOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setZoomSignal({ type: "OUT", id: Date.now() });
  };

  const handleResetZoom = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setZoomSignal({ type: "RESET", id: Date.now() });
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] rounded-2xl bg-gradient-to-b from-[#0a0f1d] to-[#060a14] border border-cyan-500/20 shadow-2xl overflow-hidden group select-none">
      
      {/* 3D Laboratory Scene */}
      <Canvas
        shadows
        camera={{ position: [4.8, 6.2, 7.2], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Ambient & Directional Lighting Setup */}
        <ambientLight intensity={0.8} />
        <directionalLight
          castShadow
          position={[6, 12, 6]}
          intensity={1.8}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={25}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0001}
        />
        {/* Soft cool fill light */}
        <directionalLight position={[-6, 4, -4]} intensity={0.6} color="#38bdf8" />
        {/* Studio warm rim light */}
        <pointLight position={[0, 4, 3]} intensity={0.5} color="#ffffff" />

        {/* Camera Controller: enableZoom={false} on OrbitControls */}
        <CameraController 
          cameraView={cameraView} 
          zoomSignal={zoomSignal}
          onZoomApplied={() => setZoomSignal(null)}
          onDistanceChange={setCurrentDistance}
        />

        {/* Realistic Contact Floor Shadow */}
        <ContactShadows 
          position={[0, -0.58, 0]} 
          opacity={0.65} 
          scale={12} 
          blur={1.5} 
          far={4} 
        />

        {/* Electronics Hardware Group */}
        <group position={[0, 0, 0]}>
          <LabDesk />
          <Breadboard onSelectComponent={onSelectComponent} />
          <ESP32 onSelectComponent={onSelectComponent} />
          <PushButton 
            isPressed={isPressed} 
            onPress={onPressButton} 
            onSelectComponent={onSelectComponent} 
          />
          <LED 
            ledActive={ledActive} 
            onSelectComponent={onSelectComponent} 
          />
          <Resistor onSelectComponent={onSelectComponent} />
          <OledDisplay 
            count={count} 
            isProcessing={isProcessing} 
            onSelectComponent={onSelectComponent} 
          />
          <JumperWires onSelectComponent={onSelectComponent} />
          <UsbCable />
          <ComponentLabels 
            showLabels={showLabels} 
            onSelectComponent={onSelectComponent} 
          />
        </group>
      </Canvas>

      {/* Floating Viewport Overlay: Interactive Guidance HUD */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5 font-mono text-[11px] z-10">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">INTERACTIVE 3D VIRTUAL BREADBOARD</span>
        </div>
        <div className="bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 rounded-md text-slate-400 border border-slate-800 hidden sm:block">
          Left Drag: Rotate • Buttons: Zoom (+/-) • Right Drag: Pan
        </div>
      </div>

      {/* 🔍 Dedicated Floating 3D Zoom Controls Dock (Top Right) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-center bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-1.5 shadow-2xl gap-1.5 font-mono">
        {/* Zoom In Button */}
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (+)"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-black transition-all duration-200 active:scale-90 border border-slate-700/80 hover:border-cyan-400 shadow-md group cursor-pointer"
        >
          <ZoomIn className="w-4 h-4 transition-transform group-hover:scale-110" />
        </button>

        {/* Current Zoom Level Badge */}
        <div className="px-1 py-0.5 text-[9px] text-cyan-300 font-bold select-none text-center tracking-tighter" title="Current Zoom Scale">
          {zoomPercent}%
        </div>

        {/* Zoom Out Button */}
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-black transition-all duration-200 active:scale-90 border border-slate-700/80 hover:border-cyan-400 shadow-md group cursor-pointer"
        >
          <ZoomOut className="w-4 h-4 transition-transform group-hover:scale-110" />
        </button>

        {/* Reset / Center View Button */}
        <button
          type="button"
          onClick={handleResetZoom}
          title="Reset Zoom / Framing"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-all duration-200 active:scale-90 border border-slate-800 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Prompt pointing to Pushbutton */}
      <div className="absolute bottom-3 left-3 bg-cyan-950/80 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-lg text-cyan-300 text-xs font-mono flex items-center gap-2 pointer-events-none shadow-xl z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Click the 3D tactile button to increment visitor count</span>
      </div>

      {/* Viewport Corner Tech Watermark */}
      <div className="absolute bottom-3 right-3 text-right pointer-events-none z-10">
        <span className="text-[10px] font-mono text-slate-500 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
          Smooth 60 FPS • WebGL 2.0
        </span>
      </div>

    </div>
  );
}
