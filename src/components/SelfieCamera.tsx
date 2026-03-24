"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Camera, RotateCcw, Check, X } from "lucide-react";

interface SelfieCameraProps {
  onCapture: (imageBase64: string) => void;
  onCancel: () => void;
}

export default function SelfieCamera({ onCapture, onCancel }: SelfieCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [loading, setLoading] = useState(true);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setLoading(false);
      }
    } catch {
      setCameraError("Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.");
      setLoading(false);
    }
  }, []);

  // Initial camera start
  useEffect(() => {
    void initCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCaptured(dataUrl);
    stopCamera();
  }

  function retake() {
    setCaptured(null);
    setCameraError("");
    setLoading(true);
    void initCamera();
  }

  function confirm() {
    if (captured) {
      onCapture(captured);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl overflow-hidden w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            Ambil Foto Selfie
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-black aspect-[4/3]">
          {loading && !captured && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <p className="text-red-400 text-center text-sm">{cameraError}</p>
            </div>
          )}

          {!captured ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          ) : (
            <Image
              src={captured}
              alt="Selfie preview"
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
              unoptimized
            />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Face guide overlay */}
          {!captured && !loading && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-56 border-2 border-blue-400/60 rounded-full" />
            </div>
          )}
        </div>

        <div className="p-4 flex gap-3">
          {!captured ? (
            <>
              <button
                onClick={capturePhoto}
                disabled={loading || !!cameraError}
                className="flex-1 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-5 h-5" />
                Ambil Foto
              </button>
              <button
                onClick={onCancel}
                className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-3 transition-colors"
              >
                Batal
              </button>
            </>
          ) : (
            <>
              <button
                onClick={confirm}
                className="flex-1 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-5 h-5" />
                Gunakan Foto
              </button>
              <button
                onClick={retake}
                className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-3 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
