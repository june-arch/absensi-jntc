"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  ShieldCheck,
  User,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { Profile } from "@/types";

interface EmployeesClientProps {
  employees: Profile[];
}

type FormState = {
  full_name: string;
  email: string;
  password: string;
  employee_id: string;
  department: string;
  position: string;
  role: "admin" | "employee";
  is_active: boolean;
};

const emptyForm: FormState = {
  full_name: "",
  email: "",
  password: "",
  employee_id: "",
  department: "",
  position: "",
  role: "employee",
  is_active: true,
};

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-gray-300 text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      />
    </div>
  );
}

function ModalContent({
  form,
  setForm,
  error,
  isEdit,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  error: string;
  isEdit?: boolean;
}) {
  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Nama Lengkap"
          name="full_name"
          value={form.full_name}
          onChange={(v) => setForm((prev) => ({ ...prev, full_name: v }))}
          required
          placeholder="John Doe"
        />
        <InputField
          label="ID Karyawan"
          name="employee_id"
          value={form.employee_id}
          onChange={(v) => setForm((prev) => ({ ...prev, employee_id: v }))}
          required
          placeholder="EMP-001"
        />
      </div>
      {!isEdit && (
        <>
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(v) => setForm((prev) => ({ ...prev, email: v }))}
            required
            placeholder="email@perusahaan.com"
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(v) => setForm((prev) => ({ ...prev, password: v }))}
            required
            placeholder="Minimal 6 karakter"
          />
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Departemen"
          name="department"
          value={form.department}
          onChange={(v) => setForm((prev) => ({ ...prev, department: v }))}
          placeholder="Engineering"
        />
        <InputField
          label="Jabatan"
          name="position"
          value={form.position}
          onChange={(v) => setForm((prev) => ({ ...prev, position: v }))}
          placeholder="Software Engineer"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as "admin" | "employee" }))}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="employee">Karyawan</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {isEdit && (
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Status</label>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                form.is_active
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-gray-800 border-gray-700 text-gray-400"
              }`}
            >
              {form.is_active ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              {form.is_active ? "Aktif" : "Nonaktif"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeesClient({ employees: initialEmployees }: EmployeesClientProps) {
  const [employees, setEmployees] = useState<Profile[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Profile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm(emptyForm);
    setError("");
    setShowAddModal(true);
  }

  function openEdit(emp: Profile) {
    setEditEmployee(emp);
    setForm({
      full_name: emp.full_name,
      email: emp.email,
      password: "",
      employee_id: emp.employee_id,
      department: emp.department,
      position: emp.position,
      role: emp.role,
      is_active: emp.is_active,
    });
    setError("");
  }

  async function handleAdd() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah karyawan");
      // Refresh page to reload from server
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit() {
    if (!editEmployee) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/employees/${editEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          employee_id: form.employee_id,
          department: form.department,
          position: form.position,
          role: form.role,
          is_active: form.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengupdate karyawan");
      setEmployees((prev) =>
        prev.map((e) => (e.id === editEmployee.id ? { ...e, ...data.data } : e))
      );
      setEditEmployee(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus karyawan");
      }
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-400" />
            Manajemen Karyawan
          </h1>
          <p className="text-gray-400 text-sm mt-1">{employees.length} karyawan terdaftar</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl px-4 py-2.5 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Karyawan</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Cari nama, email, ID, atau departemen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error */}
      {error && !showAddModal && !editEmployee && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider">Karyawan</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider hidden md:table-cell">Departemen</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Jabatan</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider">Role</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-right text-gray-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-10">
                    Tidak ada karyawan ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{emp.full_name}</p>
                          <p className="text-gray-400 text-xs">{emp.email}</p>
                          <p className="text-gray-500 text-xs">{emp.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm hidden md:table-cell">
                      {emp.department || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm hidden lg:table-cell">
                      {emp.position || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          emp.role === "admin"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {emp.role === "admin" ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {emp.role === "admin" ? "Admin" : "Karyawan"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                          emp.is_active
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {emp.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(emp)}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(emp.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Tambah Karyawan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ModalContent form={form} setForm={setForm} error={error} />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleAdd}
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-700 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Simpan
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editEmployee && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Edit Karyawan</h3>
              <button onClick={() => setEditEmployee(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ModalContent form={form} setForm={setForm} error={error} isEdit />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleEdit}
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-700 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Simpan Perubahan
                  </>
                )}
              </button>
              <button
                onClick={() => setEditEmployee(null)}
                className="px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Hapus Karyawan</h3>
                <p className="text-gray-400 text-sm">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Apakah Anda yakin ingin menghapus karyawan{" "}
              <strong className="text-white">
                {employees.find((e) => e.id === deleteConfirm)?.full_name}
              </strong>
              ? Semua data absensi akan ikut terhapus.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-400 disabled:bg-gray-700 text-white font-semibold rounded-xl py-2.5 transition-colors"
              >
                {loading ? "Menghapus..." : "Hapus"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-2.5 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
