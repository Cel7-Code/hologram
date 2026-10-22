"use client";

import { Canvas } from "@react-three/fiber";
import { ARButton, XR } from "@react-three/xr";
import { Text } from "@react-three/drei";
import { useState } from "react";

export default function TrueAR() {
  const [isARSupported, setIsARSupported] = useState(true);

  return (
    <div className="w-full h-screen bg-black relative flex flex-col items-center justify-center overflow-hidden">
      {/* Tombol ajaib untuk masuk ke mode AR Asli */}
      <ARButton
        className="absolute bottom-10 z-50 px-8 py-3 bg-cyan-500 text-black font-bold rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)] cursor-pointer"
        style={{ position: "absolute", bottom: "40px" }} // Memaksa style bawaan library
      />

      {/* Tampilan sebelum masuk AR (Latar Belakang Hitam) */}
      <div className="absolute top-1/3 text-center px-4 z-10 pointer-events-none">
        <h1 className="text-3xl font-bold text-cyan-400 mb-4 font-mono">
          True WebXR
        </h1>
        <p className="text-white/80 text-sm max-w-sm mx-auto">
          Tekan tombol di bawah melalui browser HP (Chrome Android / Safari iOS
          17+) untuk meletakkan teks hologram ke dalam dunia nyata.
        </p>
      </div>

      {/* Dunia 3D / AR Canvas */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <Canvas>
          <XR>
            {/* Pencahayaan agar teks terlihat */}
            <ambientLight intensity={2} />

            {/* 
              Teks ini diletakkan di koordinat 3D: 
              x: 0 (Tengah), y: 0 (Setinggi mata/kamera awal), z: -1 (Satu meter di depan HP kamu) 
            */}
            <Text
              position={[0, 0, -1]}
              fontSize={0.2}
              color="#06b6d4" // Warna Cyan
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="#a5f3fc"
            >
              Hello, World!
            </Text>
          </XR>
        </Canvas>
      </div>
    </div>
  );
}
