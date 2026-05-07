import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import Navbar from "@/components/Navbar";
import SessionVerifier from "@/components/SessionVerifier";
import { ensureProfileExistsServer } from "@/lib/profile-utils-server";
import type { Profile, Attendance } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[DASHBOARD] Session:", await supabase.auth.getSession());
  console.log("[DASHBOARD] User ID:", user?.id);
  if (!user) {  
    console.log("[DASHBOARD] No user found, redirecting to login");
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  console.log("[DASHBOARD] Profile query error:", profileError);
  console.log("[DASHBOARD] Profile data:", profile);
  console.log("[DASHBOARD] Looking for profile with user_id:", user.id);
  
  // Let's also check if there are any profiles at all
  const { data: allProfiles } = await supabase.from("profiles").select("id, email, full_name").limit(5);
  console.log("[DASHBOARD] Sample profiles in database:", allProfiles);
  
  // If profile doesn't exist, try to create it as a fallback
  let finalProfile = profile;
  if (!profile || profileError) {
    console.log("[DASHBOARD] Profile not found, attempting to create fallback profile...");
    try {
      // Use the server-side utility function to create the profile
      finalProfile = await ensureProfileExistsServer(user, user.user_metadata);
      console.log("[DASHBOARD] Fallback profile created successfully");
    } catch (error) {
      console.log("[DASHBOARD] Failed to create fallback profile:", error);
      redirect("/login");
    }
  }
  
  if (!finalProfile) {
    console.log("[DASHBOARD] No profile available, redirecting to login");
    redirect("/login");
  }

  // Get today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: true });

  // Get history (last 20 records)
  const { data: history } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <SessionVerifier>
      <div className="min-h-screen bg-gray-950">
        <Navbar profile={finalProfile as Profile} />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <DashboardClient
            profile={finalProfile as Profile}
            todayAttendance={(todayAttendance || []) as Attendance[]}
            history={(history || []) as Attendance[]}
          />
        </main>
      </div>
    </SessionVerifier>
  );
}
