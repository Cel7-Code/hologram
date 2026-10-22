"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function VoiceAR() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [transcript, setTranscript] = useState<string>(""); // Menyimpan kata terakhir yang diucapkan

  const router = useRouter();
  const recognitionRef = useRef<any>(null); // Menyimpan instance mic agar bisa dimatikan nanti

  const startExperience = async () => {
    try {
      setError("");

      // 1. Minta Izin Kamera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false, // Jangan ambil audio ke video, karena mic diurus terpisah di bawah
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 2. Persiapan Voice Recognition (Web Speech API)
      // Menggunakan "as any" karena ini API khusus browser yang tidak ada di standar TypeScript dasar
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        throw new Error(
          "Browser ini tidak mendukung Voice Recognition. Tolong gunakan Google Chrome.",
        );
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Terus mendengarkan tanpa putus
      recognition.interimResults = false;
      recognition.lang = "en-US"; // Setting ke bahasa Inggris agar akurat menangkap kata "next"

      // 3. Logika saat suara berhasil ditangkap
      recognition.onresult = (event: any) => {
        // Ambil kata terakhir yang diucapkan user
        const currentWord = event.results[
          event.results.length - 1
        ][0].transcript
          .trim()
          .toLowerCase();

        setTranscript(currentWord); // Tampilkan di layar agar user tahu suaranya masuk

        // Jika sistem mendengar kata "next"
        if (currentWord.includes("next")) {
          // Hentikan pendengaran dan kamera sebelum pindah halaman
          recognition.stop();
          if (videoRef.current?.srcObject) {
            const currentStream = videoRef.current.srcObject as MediaStream;
            currentStream.getTracks().forEach((track) => track.stop());
          }

          // Lakukan perpindahan halaman (contoh: ke halaman Data User)
          router.push("/users");
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Mic error:", event.error);
      };

      // Trik agar mic terus menyala (Browser sering mematikan mic jika hening terlalu lama)
      recognition.onend = () => {
        if (isStarted && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      // Nyalakan mikrofon
      recognition.start();
      recognitionRef.current = recognition;

      setIsStarted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Gagal mengakses Kamera atau Mikrofon: " + err.message);
      } else {
        setError("Terjadi kesalahan sistem.");
      }
    }
  };

  // Bersihkan kamera & mic jika user tiba-tiba memencet tombol Back
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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
            Hologram + Voice
          </h1>
          <p className="text-white/80 mb-8 text-sm">
            Izinkan akses kamera dan <b>mikrofon</b>. Setelah masuk, katakan{" "}
            <b>"Next"</b> untuk pindah halaman.
          </p>
          {error && (
            <p className="text-red-400 mb-4 bg-red-900/50 px-4 py-2 rounded-lg text-sm font-semibold">
              {error}
            </p>
          )}

          <button
            onClick={startExperience}
            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all cursor-pointer"
          >
            START EXPERIENCE
          </button>
        </div>
      )}

      {/* 2. TEKS DI TENGAH DAN INDIKATOR MIC (Setelah Dimulai) */}
      {isStarted && (
        <>
          {/* Teks "Hello, World!" diam secara absolut di tengah layar */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <h1
              className="text-6xl md:text-8xl font-black text-transparent bg-clip-text font-mono tracking-widest text-center"
              style={{
                backgroundImage: "linear-gradient(to bottom, #a5f3fc, #06b6d4)",
                filter: "drop-shadow(0 0 15px rgba(6,182,212,0.8))",
              }}
            >
              Hello, World!
            </h1>
          </div>

          {/* Indikator Status Mikrofon di pojok bawah */}
          <div className="absolute bottom-10 z-20 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-5 py-2 rounded-full border border-white/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-white/80 text-sm font-semibold">
                Mendengarkan... Katakan "Next"
              </span>
            </div>

            {/* Teks bantuan untuk menampilkan apa yang sedang didengar sistem */}
            {transcript && (
              <p className="text-white/60 text-xs italic bg-black/40 px-3 py-1 rounded-md">
                Terdeteksi: "{transcript}"
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
