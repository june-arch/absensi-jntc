import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import Navbar from "@/components/Navbar";
import type { Profile, Attendance } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
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
    <div className="min-h-screen bg-gray-950">
      <Navbar profile={profile as Profile} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <DashboardClient
          profile={profile as Profile}
          todayAttendance={(todayAttendance || []) as Attendance[]}
          history={(history || []) as Attendance[]}
        />
      </main>
    </div>
  );
}
