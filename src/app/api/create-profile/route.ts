import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, employee_id, role } = body;

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json({ error: "Profile already exists" }, { status: 400 });
    }

    // Create profile using service role (bypass RLS)
    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: full_name || user.user_metadata?.full_name || '',
        employee_id: employee_id || user.user_metadata?.employee_id || `EMP-${user.id.slice(0, 8)}`,
        role: role || user.user_metadata?.role || 'employee',
      })
      .select()
      .single();

    if (insertError) {
      console.log("[API_CREATE_PROFILE] Error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ data: profile }, { status: 200 });

  } catch (error) {
    console.log("[API_CREATE_PROFILE] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
