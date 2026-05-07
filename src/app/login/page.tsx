"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    console.log("[LOGIN] Attempting signInWithPassword...");
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("[LOGIN] Error:", error.message);
      setError(error.message);
      setLoading(false);
      return;
    }

    console.log("[LOGIN] Success! Session:", data.session ? "exists" : "null", "User:", data.user?.email);
    console.log("[LOGIN] Cookies after login:", document.cookie);

    // Verify session is established before redirecting
    if (data.session && data.user) {
      console.log("[LOGIN] Verifying session before redirect...");
      
      // Wait a moment for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refresh the session to ensure it's properly established
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.log("[LOGIN] Session refresh error:", refreshError.message);
        setError("Session refresh failed. Please try again.");
        setLoading(false);
        return;
      }
      
      if (refreshedSession) {
        console.log("[LOGIN] Session refreshed successfully, verifying before redirect...");
        
        // Final verification
        const { data: { session: verifiedSession }, error: verificationError } = await supabase.auth.getSession();
        
        if (verificationError) {
          console.log("[LOGIN] Session verification error:", verificationError.message);
          setError("Session verification failed. Please try again.");
          setLoading(false);
          return;
        }
        
        if (verifiedSession) {
          console.log("[LOGIN] Session verified successfully, redirecting to dashboard");
          router.push("/dashboard");
          router.refresh();
        } else {
          console.log("[LOGIN] Session verification failed - no session found after refresh");
          setError("Login successful but session not established. Please try again.");
          setLoading(false);
        }
      } else {
        console.log("[LOGIN] Session refresh failed - no session returned");
        setError("Login successful but session refresh failed. Please try again.");
        setLoading(false);
      }
    } else {
      console.log("[LOGIN] Login succeeded but no session data received");
      setError("Login successful but session not established. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Image
              src="/logo.png"
              alt="AbsensiKu Logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">AbsensiKu</h1>
          <p className="text-blue-300 mt-1">Sistem Absensi Digital</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Masuk ke Akun</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                required
                className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 text-white font-semibold rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* <p className="text-center text-blue-300 text-sm mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-blue-100 hover:text-white font-medium underline">
              Daftar di sini
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
