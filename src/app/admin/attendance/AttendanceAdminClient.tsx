"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  ChevronDown,
  X,
} from "lucide-react";
import type { Profile, Attendance } from "@/types";

type AttendanceWithProfile = Attendance & { profile: Profile };

interface AttendanceAdminClientProps {
  attendance: AttendanceWithProfile[];
  employees: Pick<Profile, "id" | "full_name" | "employee_id">[];
}

export default function AttendanceAdminClient({
  attendance,
  employees,
}: AttendanceAdminClientProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "check_in" | "check_out">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "late" | "absent">("all");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [filterDate, setFilterDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceWithProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = attendance.filter((a) => {
    const matchSearch =
      !search ||
      a.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.profile?.employee_id?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || a.type === filterType;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchEmployee = filterEmployee === "all" || a.user_id === filterEmployee;
    const matchDate =
      !filterDate ||
      new Date(a.created_at).toLocaleDateString("id-ID") ===
        new Date(filterDate).toLocaleDateString("id-ID");
    return matchSearch && matchType && matchStatus && matchEmployee && matchDate;
  });

  // Stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayRecords = attendance.filter(
    (a) => new Date(a.created_at) >= todayStart
  );
  const todayCheckins = todayRecords.filter((a) => a.type === "check_in");
  const todayLate = todayCheckins.filter((a) => a.status === "late");
  const uniqueEmployeesToday = new Set(todayRecords.map((a) => a.user_id)).size;

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
            <XCircle className="w-3 h-3" /> Absen
          </span>
        );
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-blue-400" />
          Data Absensi Karyawan
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {attendance.length} total catatan absensi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Hadir Hari Ini",
            value: uniqueEmployeesToday,
            color: "blue",
            icon: User,
          },
          {
            label: "Check-in Hari Ini",
            value: todayCheckins.length,
            color: "green",
            icon: CheckCircle,
          },
          {
            label: "Terlambat",
            value: todayLate.length,
            color: "yellow",
            icon: AlertCircle,
          },
          {
            label: "Total Absensi",
            value: attendance.length,
            color: "purple",
            icon: ClipboardList,
          },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className={`bg-gray-900 border border-gray-800 rounded-2xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs font-medium">{label}</p>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  color === "blue"
                    ? "bg-blue-500/20"
                    : color === "green"
                    ? "bg-green-500/20"
                    : color === "yellow"
                    ? "bg-yellow-500/20"
                    : "bg-purple-500/20"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    color === "blue"
                      ? "text-blue-400"
                      : color === "green"
                      ? "text-green-400"
                      : color === "yellow"
                      ? "text-yellow-400"
                      : "text-purple-400"
                  }`}
                />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Cari nama atau ID karyawan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            showFilters
              ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
              : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Tipe</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua</option>
              <option value="check_in">Masuk</option>
              <option value="check_out">Keluar</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua</option>
              <option value="present">Hadir</option>
              <option value="late">Terlambat</option>
              <option value="absent">Absen</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Karyawan</label>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Tanggal</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <p className="text-gray-500 text-sm mb-3">{filtered.length} catatan ditampilkan</p>

      {/* Attendance Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider">Karyawan</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider hidden md:table-cell">Tanggal & Waktu</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider">Tipe</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider">Status</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Lokasi</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider">Foto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-10">
                    Tidak ada data absensi
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {record.profile?.full_name || "—"}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {record.profile?.employee_id || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-white text-sm">
                        {new Date(record.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(record.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${
                          record.type === "check_in"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-orange-500/20 text-orange-400"
                        }`}
                      >
                        {record.type === "check_in" ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {record.latitude ? (
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-green-400" />
                          {record.latitude.toFixed(4)}, {record.longitude?.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-800">
                        <Image
                          src={record.selfie_url}
                          alt="Selfie"
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Detail Absensi</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selfie */}
            <div className="relative w-full aspect-square bg-gray-800">
              <Image
                src={selectedRecord.selfie_url}
                alt="Selfie"
                fill
                className="object-cover"
                sizes="(max-width: 384px) 100vw, 384px"
              />
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">
                    {selectedRecord.profile?.full_name}
                  </p>
                  <p className="text-gray-400 text-sm">{selectedRecord.profile?.employee_id}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      selectedRecord.type === "check_in"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-orange-500/20 text-orange-400"
                    }`}
                  >
                    {selectedRecord.type === "check_in" ? "Masuk" : "Keluar"}
                  </span>
                  {getStatusBadge(selectedRecord.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-800 rounded-xl p-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Tanggal</p>
                  <p className="text-white">
                    {new Date(selectedRecord.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Waktu</p>
                  <p className="text-white">
                    {new Date(selectedRecord.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Departemen</p>
                  <p className="text-white">{selectedRecord.profile?.department || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Jabatan</p>
                  <p className="text-white">{selectedRecord.profile?.position || "—"}</p>
                </div>
              </div>

              {selectedRecord.latitude && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span>
                    {selectedRecord.latitude.toFixed(6)}, {selectedRecord.longitude?.toFixed(6)}
                  </span>
                </div>
              )}

              {selectedRecord.notes && (
                <p className="text-gray-400 text-sm">
                  <span className="text-gray-500">Catatan: </span>
                  {selectedRecord.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
