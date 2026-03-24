import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import EmployeesClient from "./EmployeesClient";
import type { Profile } from "@/types";

export default async function AdminEmployeesPage() {
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

  const { data: employees } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar profile={profile as Profile} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <EmployeesClient employees={(employees || []) as Profile[]} />
      </main>
    </div>
  );
}
