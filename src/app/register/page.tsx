// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { createClient } from "@/lib/supabase/client";
// import { ensureProfileExists } from "@/lib/profile-utils";
// import { UserPlus, Eye, EyeOff, Fingerprint } from "lucide-react";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     full_name: "",
//     email: "",
//     password: "",
//     employee_id: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }

//   async function handleRegister(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const supabase = createClient();
//     console.log("[REGISTER] Attempting sign up with:", { email: form.email, full_name: form.full_name, employee_id: form.employee_id });
    
//     const { data, error } = await supabase.auth.signUp({
//       email: form.email,
//       password: form.password,
//       options: {
//         data: {
//           full_name: form.full_name,
//           employee_id: form.employee_id,
//           role: "employee",
//         },
//       },
//     });

//     if (error) {
//       console.log("[REGISTER] Sign up error:", error.message);
//       setError(error.message);
//       setLoading(false);
//       return;
//     }

//     console.log("[REGISTER] Sign up successful:", data);
    
//     // Wait a moment for the trigger to create the profile
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     // Ensure profile exists (create if trigger failed)
//     if (data.user) {
//       try {
//         await ensureProfileExists(data.user, {
//           full_name: form.full_name,
//           employee_id: form.employee_id,
//           role: "employee",
//         });
//         console.log("[REGISTER] Profile ensured successfully");
//       } catch (error) {
//         console.log("[REGISTER] Profile creation failed:", error);
//         setError("Registration successful but profile creation failed. Please contact support.");
//         setLoading(false);
//         return;
//       }
//     }

//     router.push("/dashboard");
//     router.refresh();
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
//             <Fingerprint className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-white">AbsensiKu</h1>
//           <p className="text-blue-300 mt-1">Sistem Absensi Digital</p>
//         </div>

//         {/* Card */}
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
//           <h2 className="text-xl font-semibold text-white mb-6">Buat Akun Baru</h2>

//           {error && (
//             <div className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg p-3 mb-4 text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleRegister} className="space-y-4">
//             <div>
//               <label className="block text-blue-200 text-sm font-medium mb-1.5">
//                 Nama Lengkap
//               </label>
//               <input
//                 type="text"
//                 name="full_name"
//                 value={form.full_name}
//                 onChange={handleChange}
//                 placeholder="John Doe"
//                 required
//                 className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-blue-200 text-sm font-medium mb-1.5">
//                 ID Karyawan
//               </label>
//               <input
//                 type="text"
//                 name="employee_id"
//                 value={form.employee_id}
//                 onChange={handleChange}
//                 placeholder="EMP-001"
//                 required
//                 className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-blue-200 text-sm font-medium mb-1.5">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 placeholder="nama@perusahaan.com"
//                 required
//                 className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-blue-200 text-sm font-medium mb-1.5">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={form.password}
//                   onChange={handleChange}
//                   placeholder="Minimal 6 karakter"
//                   required
//                   minLength={6}
//                   className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
//                 >
//                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 text-white font-semibold rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors mt-2"
//             >
//               {loading ? (
//                 <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
//               ) : (
//                 <>
//                   <UserPlus className="w-5 h-5" />
//                   Daftar
//                 </>
//               )}
//             </button>
//           </form>

//           <p className="text-center text-blue-300 text-sm mt-6">
//             Sudah punya akun?{" "}
//             <Link href="/login" className="text-blue-100 hover:text-white font-medium underline">
//               Masuk di sini
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
