"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Clock, CheckCircle, XCircle, AlertCircle, MapPin } from "lucide-react";
import SelfieCamera from "@/components/SelfieCamera";
import type { Profile, Attendance } from "@/types";

interface DashboardClientProps {
  profile: Profile;
  todayAttendance: Attendance[];
  history: Attendance[];
}

export default function DashboardClient({
  profile,
  todayAttendance,
  history,
}: DashboardClientProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [attendanceType, setAttendanceType] = useState<"check_in" | "check_out">("check_in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [localHistory, setLocalHistory] = useState<Attendance[]>(history);
  const [localToday, setLocalToday] = useState<Attendance[]>(todayAttendance);

  const hasCheckedIn = localToday.some((a) => a.type === "check_in");
  const hasCheckedOut = localToday.some((a) => a.type === "check_out");

  const now = new Date();
  const timeString = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const dateString = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function openCamera(type: "check_in" | "check_out") {
    setAttendanceType(type);
    setShowCamera(true);
    setError("");
    setSuccess("");
  }

  async function handleCapture(imageBase64: string) {
    setShowCamera(false);
    setLoading(true);
    setError("");

    try {
      // Upload selfie to ImageKit
      const uploadRes = await fetch("/api/upload-selfie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          fileName: `selfie-${attendanceType}-${Date.now()}.jpg`,
        }),
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Gagal upload foto");
      }

      // Get current location
      let latitude: number | null = null;
      let longitude: number | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // Location not available, continue without it
      }

      // Submit attendance
      const attendanceRes = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: attendanceType,
          selfie_url: uploadData.url,
          latitude,
          longitude,
        }),
      });

      const attendanceData = await attendanceRes.json();

      if (!attendanceRes.ok) {
        throw new Error(attendanceData.error || "Gagal menyimpan absensi");
      }

      const newRecord = attendanceData.data as Attendance;
      setLocalToday((prev) => [...prev, newRecord]);
      setLocalHistory((prev) => [newRecord, ...prev]);
      setSuccess(
        attendanceType === "check_in"
          ? "Absensi masuk berhasil dicatat!"
          : "Absensi keluar berhasil dicatat!"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "present":
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" /> Hadir
          </span>
        );
      case "late":
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" /> Terlambat
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> Tidak Hadir
          </span>
        );
    }
  }

  const checkInRecord = localToday.find((a) => a.type === "check_in");
  const checkOutRecord = localToday.find((a) => a.type === "check_out");

  return (
    <>
      {showCamera && (
        <SelfieCamera
          onCapture={handleCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Halo, {profile.full_name.split(" ")[0]}!
        </h1>
        <p className="text-gray-400 text-sm mt-1">{dateString}</p>
      </div>

      {/* Alert messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl p-4 mb-4 flex items-center gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-300 rounded-xl p-4 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Today Status Card */}
      <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-700/30 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-300 text-sm">Waktu Sekarang</p>
            <p className="text-4xl font-bold text-white font-mono">{timeString}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-300 text-sm">Status Hari Ini</p>
            <p className="text-white font-semibold mt-1">
              {!hasCheckedIn && !hasCheckedOut && "Belum Absen"}
              {hasCheckedIn && !hasCheckedOut && "Sudah Masuk"}
              {hasCheckedIn && hasCheckedOut && "Sudah Pulang"}
            </p>
          </div>
        </div>

        {/* Today attendance times */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-blue-300 text-xs mb-1">Masuk</p>
            {checkInRecord ? (
              <div>
                <p className="text-white font-semibold">
                  {new Date(checkInRecord.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="mt-1">{getStatusBadge(checkInRecord.status)}</div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">-</p>
            )}
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-blue-300 text-xs mb-1">Keluar</p>
            {checkOutRecord ? (
              <div>
                <p className="text-white font-semibold">
                  {new Date(checkOutRecord.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="mt-1">{getStatusBadge(checkOutRecord.status)}</div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">-</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openCamera("check_in")}
            disabled={hasCheckedIn || loading}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl py-3 transition-colors"
          >
            {loading && attendanceType === "check_in" ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Camera className="w-5 h-5" />
                {hasCheckedIn ? "Sudah Masuk" : "Absen Masuk"}
              </>
            )}
          </button>

          <button
            onClick={() => openCamera("check_out")}
            disabled={!hasCheckedIn || hasCheckedOut || loading}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl py-3 transition-colors"
          >
            {loading && attendanceType === "check_out" ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Camera className="w-5 h-5" />
                {hasCheckedOut ? "Sudah Keluar" : "Absen Keluar"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Riwayat Absensi
        </h2>

        {localHistory.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            <Clock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Belum ada riwayat absensi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {localHistory.map((record) => (
              <div
                key={record.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4"
              >
                {/* Selfie thumbnail */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                  <Image
                    src={record.selfie_url}
                    alt="Selfie"
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        record.type === "check_in"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}
                    >
                      {record.type === "check_in" ? "Masuk" : "Keluar"}
                    </span>
                    {getStatusBadge(record.status)}
                  </div>
                  <p className="text-white font-medium text-sm">
                    {new Date(record.created_at).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(record.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {record.latitude && (
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Lokasi tersimpan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
