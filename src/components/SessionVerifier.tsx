"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SessionVerifierProps {
  children: React.ReactNode;
}

export default function SessionVerifier({ children }: SessionVerifierProps) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    async function verifySession() {
      try {
        const supabase = createClient();
        
        // Wait a moment for any potential session to be established
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log("[SESSION_VERIFIER] Session verification error:", error.message);
          router.push("/login");
          return;
        }
        
        if (session) {
          console.log("[SESSION_VERIFIER] Session verified successfully");
          setHasValidSession(true);
        } else {
          console.log("[SESSION_VERIFIER] No session found, redirecting to login");
          router.push("/login");
        }
      } catch (err) {
        console.log("[SESSION_VERIFIER] Session verification failed:", err);
        router.push("/login");
      } finally {
        setIsVerifying(false);
      }
    }

    verifySession();
  }, [router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  if (!hasValidSession) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
