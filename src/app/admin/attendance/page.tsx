import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import AttendanceAdminClient from "./AttendanceAdminClient";
import type { Profile, Attendance } from "@/types";

export default async function AdminAttendancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const { data: attendance } = await supabase
    .from("attendance")
    .select(
      `
      *,
      profile:profiles(id, full_name, employee_id, department, position)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: employees } = await supabase
    .from("profiles")
    .select("id, full_name, employee_id")
    .eq("role", "employee")
    .order("full_name");

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar profile={profile as Profile} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AttendanceAdminClient
          attendance={(attendance || []) as (Attendance & { profile: Profile })[]}
          employees={(employees || []) as Pick<Profile, "id" | "full_name" | "employee_id">[]}
        />
      </main>
    </div>
  );
}
