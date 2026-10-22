"use client";

import { Canvas } from "@react-three/fiber";
import { ARButton, XR, useHitTest, useXREvent } from "@react-three/xr";
import { Text } from "@react-three/drei";
import { useState, useRef } from "react";
import * as THREE from "three";

// --- KOMPONEN AR UNTUK SCANNING (HIT TEST) ---
function HitTestHologram() {
  const reticleRef = useRef<THREE.Mesh>(null);
  const [hologramPos, setHologramPos] = useState<THREE.Vector3 | null>(null);

  // 1. Hit Testing: Terus memindai permukaan fisik (meja/keyboard) secara real-time
  useHitTest((hitMatrix) => {
    if (reticleRef.current) {
      reticleRef.current.visible = true; // Munculkan cincin target
      reticleRef.current.matrix.copy(hitMatrix); // Tempelkan cincin ke permukaan fisik
    }
  });

  // 2. Event saat layar HP disentuh (Tap to Place)
  useXREvent("select", () => {
    // Jika cincin target sedang menempel di meja, ambil koordinat 3D-nya
    if (reticleRef.current && reticleRef.current.visible) {
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(reticleRef.current.matrix);
      setHologramPos(position); // Kunci posisi teks di koordinat fisik tersebut
    }
  });

  return (
    <>
      {/* Cincin penanda target (Reticle) yang akan menempel di permukaan keyboard */}
      <mesh ref={reticleRef} matrixAutoUpdate={false} visible={false}>
        <ringGeometry args={[0.04, 0.05, 32]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* Render Teks Hologram HANYA setelah user melakukan Tap di layar */}
      {hologramPos && (
        <Text
          position={hologramPos}
          // Tambahkan sedikit Y-offset agar teks melayang sedikit di atas tombol Enter
          position-y={hologramPos.y + 0.05}
          fontSize={0.08}
          color="#06b6d4"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.005}
          outlineColor="#a5f3fc"
        >
          Hello, World!
        </Text>
      )}
    </>
  );
}

// --- KOMPONEN UTAMA UI ---
export default function TrueARHitTest() {
  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Tombol Start AR dengan syarat Wajib Support Hit-Test */}
      <ARButton
        sessionInit={{ requiredFeatures: ["hit-test"] }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 px-8 py-3 bg-cyan-500 text-black font-bold rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)] cursor-pointer"
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      {/* Panduan Layar Sebelum Mulai */}
      <div className="absolute top-1/4 w-full text-center px-4 z-10 pointer-events-none">
        <h1 className="text-3xl font-bold text-cyan-400 mb-4 font-mono">
          AR Hit Test
        </h1>
        <div className="text-white/80 text-sm max-w-sm mx-auto bg-white/10 p-4 rounded-xl backdrop-blur-sm text-left">
          <p className="font-bold text-white mb-2">Cara Penggunaan:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              Klik tombol <b>ENTER AR</b>.
            </li>
            <li>Arahkan kamera menyapu meja/keyboard perlahan.</li>
            <li>Tunggu sampai cincin target biru muncul di atas tombol.</li>
            <li>
              <b>Tap/Sentuh layar HP</b> untuk meletakkan teks.
            </li>
          </ol>
        </div>
      </div>

      {/* Canvas Dunia 3D */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Canvas>
          <XR>
            <ambientLight intensity={2} />
            <HitTestHologram />
          </XR>
        </Canvas>
      </div>
    </div>
  );
}
