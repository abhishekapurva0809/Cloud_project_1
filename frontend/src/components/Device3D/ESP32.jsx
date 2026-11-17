import React, { useMemo } from "react";
import * as THREE from "three";

export default function ESP32({ onSelectComponent }) {
  // RF Shield Laser-Engraving Texture
  const rfShieldTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Brushed metal base
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(0, 0, 512, 512);

    // Subtle brushed lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Engraved Logo & Text
    ctx.fillStyle = "#334155";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ESPRESSIF", 256, 110);

    ctx.font = "bold 44px sans-serif";
    ctx.fillText("ESP-WROOM-32", 256, 175);

    ctx.font = "24px monospace";
    ctx.fillText("WiFi + BT + BLE MCU", 256, 230);
    ctx.fillText("FCC ID: 2AC7Z-ESPWROOM32", 256, 290);
    ctx.fillText("MAC: 24:6F:28:B4:9C:12", 256, 340);

    // QR code placeholder
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 4;
    ctx.strokeRect(206, 380, 100, 100);
    ctx.fillRect(220, 394, 25, 25);
    ctx.fillRect(265, 394, 25, 25);
    ctx.fillRect(220, 439, 25, 25);

    return new THREE.CanvasTexture(canvas);
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelectComponent) {
      onSelectComponent({
        title: "ESP32-WROOM-32 Development Board",
        category: "Edge IoT Microcontroller",
        status: "Operational / Connected to AWS IoT Core",
        specs: [
          { label: "Core", value: "Xtensa 32-bit LX6 Dual-Core @ 240 MHz" },
          { label: "Flash / SRAM", value: "4MB SPI Flash / 520 KB SRAM" },
          { label: "WiFi / BT", value: "802.11 b/g/n (up to 150Mbps) & Bluetooth 4.2 BR/EDR/BLE" },
          { label: "Operating Voltage", value: "3.3V Logic (5V USB Input via AMS1117)" },
          { label: "Visitor Sensor Pin", value: "GPIO 4 (Configured with ISR)" },
          { label: "TLS Engine", value: "Hardware mbedTLS 1.3 Client" },
          { label: "MQTT Client ID", value: "ESP32-S3-WROOM-01" },
          { label: "Topic", value: "iot/smart-visitor/counter" }
        ],
        codeSample: `// ESP32 Hardware Interrupt & AWS IoT Core MQTT Publisher
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

const int BUTTON_GPIO = 4;
const int LED_GPIO = 2;
WiFiClientSecure netClient;
PubSubClient mqttClient(netClient);

void setup() {
  pinMode(BUTTON_GPIO, INPUT_PULLUP);
  pinMode(LED_GPIO, OUTPUT);
  attachInterrupt(BUTTON_GPIO, onButtonPress, FALLING);
  netClient.setCACert(AWS_CERT_CA);
  netClient.setCertificate(AWS_CERT_CRT);
  netClient.setPrivateKey(AWS_CERT_PRIVATE);
  mqttClient.setServer("a3k8917x-ats.iot.us-east-1.amazonaws.com", 8883);
}`
      });
    }
  };

  return (
    <group position={[-2.3, 0.05, 0]} onClick={handleClick} cursor="pointer">
      {/* ESP32 Main PCB (Black/Dark Matte) */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.08, 1.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* PCB Gold Edge Contacts (Silk-screen header pads) */}
      <mesh position={[0, 0.045, 0.82]}>
        <boxGeometry args={[3.0, 0.01, 0.1]} />
        <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.045, -0.82]}>
        <boxGeometry args={[3.0, 0.01, 0.1]} />
        <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Meandering PCB Antenna Area (Left tip of board) */}
      <mesh position={[-1.25, 0.045, 0]}>
        <boxGeometry args={[0.55, 0.01, 1.6]} />
        <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Metal RF Shield Can (ESP-WROOM-32) */}
      <mesh castShadow receiveShadow position={[-0.2, 0.14, 0]}>
        <boxGeometry args={[1.35, 0.18, 1.2]} />
        <meshStandardMaterial 
          map={rfShieldTexture} 
          metalness={0.85} 
          roughness={0.25} 
        />
      </mesh>

      {/* Micro-USB Connector Port (Right side) */}
      <mesh castShadow position={[1.5, 0.12, 0]}>
        <boxGeometry args={[0.35, 0.16, 0.45]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* USB Port Opening */}
      <mesh position={[1.68, 0.12, 0]}>
        <boxGeometry args={[0.02, 0.08, 0.3]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* AMS1117 3.3V Voltage Regulator IC */}
      <mesh castShadow position={[0.85, 0.08, -0.45]}>
        <boxGeometry args={[0.35, 0.08, 0.25]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>

      {/* CP2102 USB-to-UART Bridge IC */}
      <mesh castShadow position={[0.85, 0.07, 0.25]}>
        <boxGeometry args={[0.3, 0.06, 0.3]} />
        <meshStandardMaterial color="#111827" roughness={0.5} />
      </mesh>

      {/* Tactile Pushbuttons: BOOT and EN */}
      {/* BOOT Button */}
      <group position={[1.25, 0.09, 0.55]}>
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.08, 0.18]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* EN Button */}
      <group position={[1.25, 0.09, -0.55]}>
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.08, 0.18]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Onboard Power LED (Red - Always ON) */}
      <mesh position={[1.25, 0.06, -0.2]}>
        <boxGeometry args={[0.06, 0.04, 0.04]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.9} />
      </mesh>

      {/* Onboard Status/IO2 LED (Blue) */}
      <mesh position={[1.25, 0.06, 0.2]}>
        <boxGeometry args={[0.06, 0.04, 0.04]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} />
      </mesh>

      {/* Dual Male Header Pins inserting into Breadboard */}
      <mesh position={[0, -0.15, 0.8]}>
        <boxGeometry args={[2.9, 0.25, 0.08]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, -0.15, -0.8]}>
        <boxGeometry args={[2.9, 0.25, 0.08]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}
