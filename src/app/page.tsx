"use client";

import { useEffect, useRef, useState } from "react";

export default function HologramVR() {
  // 1. Tipe referensi secara eksplisit diatur ke HTMLVideoElement
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 2. Tipe referensi untuk menyimpan angka kemiringan (bisa null sebelum dimulai)
  const initialAngles = useRef<{ alpha: number | null; beta: number | null }>({
    alpha: null,
    beta: null,
  });

  // State untuk menggeser posisi teks hologram
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const startARExperience = async () => {
    try {
      setError("");

      // Minta Izin Kamera Belakang
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 3. Penanganan khusus TypeScript untuk requestPermission iOS
      // TypeScript murni tidak mengenali requestPermission di DeviceOrientationEvent
      const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<"granted" | "denied">;
      };

      if (typeof DeviceOrientation.requestPermission === "function") {
        const permission = await DeviceOrientation.requestPermission();
        if (permission !== "granted") {
          throw new Error("Izin sensor gerak ditolak oleh iOS.");
        }
      }

      // Mulai mendengarkan sensor kemiringan HP
      window.addEventListener("deviceorientation", handleOrientation);
      setIsStarted(true);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError("Gagal mengakses Kamera atau Sensor: " + err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    }
  };

  // 4. Parameter event diatur dengan tipe DeviceOrientationEvent bawaan browser
  const handleOrientation = (event: DeviceOrientationEvent) => {
    let { alpha, beta } = event;

    // Jika device tidak memiliki sensor gyroscope, alpha/beta akan null
    if (alpha === null || beta === null) return;

    // Set Titik Nol (Origin) di frame pertama
    if (
      initialAngles.current.alpha === null ||
      initialAngles.current.beta === null
    ) {
      initialAngles.current.alpha = alpha;
      initialAngles.current.beta = beta;
      return;
    }

    // Hitung selisih putaran HP dari titik origin
    let deltaAlpha = alpha - initialAngles.current.alpha;
    let deltaBeta = beta - initialAngles.current.beta;

    // Perbaikan matematika jika putaran alpha melewati batas 360 derajat ke 0
    if (deltaAlpha > 180) deltaAlpha -= 360;
    if (deltaAlpha < -180) deltaAlpha += 360;

    // Hitung pergeseran pixel
    const pxPerDegreeX = window.innerWidth / 60;
    const pxPerDegreeY = window.innerHeight / 60;

    const offsetX = -deltaAlpha * pxPerDegreeX;
    const offsetY = -deltaBeta * pxPerDegreeY;

    setOffset({ x: offsetX, y: offsetY });
  };

  // Cleanup saat komponen dibongkar
  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      if (videoRef.current && videoRef.current.srcObject) {
        // Assert srcObject ke MediaStream untuk mengakses fungsi getTracks()
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const resetPosition = () => {
    initialAngles.current = { alpha: null, beta: null };
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col justify-center items-center">
      {/* 1. LAYAR KAMERA */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      {/* Tampilan Sebelum Dimulai */}
      {!isStarted && (
        <div className="z-20 flex flex-col items-center bg-black/60 p-8 rounded-3xl backdrop-blur-md border border-white/20 text-center mx-4">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4 font-mono">
            Hologram VR
          </h1>
          <p className="text-white/80 mb-8 text-sm">
            Izinkan akses kamera dan sensor gerak untuk menampilkan hologram.
          </p>
          {error && (
            <p className="text-red-400 mb-4 bg-red-900/50 px-4 py-2 rounded-lg text-sm font-semibold">
              {error}
            </p>
          )}

          <button
            onClick={startARExperience}
            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all cursor-pointer"
          >
            START HOLOGRAPHIC MODE
          </button>
        </div>
      )}

      {/* 2. TEKS HOLOGRAM */}
      {isStarted && (
        <>
          <div
            style={{
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
            className="absolute top-1/2 left-1/2 z-10 pointer-events-none transition-transform duration-75 ease-out"
          >
            <h1
              className="text-6xl md:text-8xl font-black text-transparent bg-clip-text font-mono tracking-widest text-center"
              style={{
                backgroundImage: "linear-gradient(to bottom, #a5f3fc, #06b6d4)",
                filter:
                  "drop-shadow(0 0 15px rgba(6,182,212,0.8)) drop-shadow(0 0 30px rgba(6,182,212,0.6))",
              }}
            >
              Hello, World!
            </h1>
          </div>

          {/* Tombol transparan di pojok untuk mereset titik tengah */}
          <button
            onClick={resetPosition}
            className="absolute bottom-10 z-20 px-6 py-2 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full text-sm font-semibold hover:bg-white/20 transition cursor-pointer shadow-lg"
          >
            Reset Center
          </button>
        </>
      )}
    </div>
  );
}
