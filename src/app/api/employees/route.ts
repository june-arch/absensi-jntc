import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET employees error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, full_name, employee_id, department, position, role } = body;

    if (!email || !password || !full_name || !employee_id) {
      return NextResponse.json(
        { error: "email, password, full_name, and employee_id are required" },
        { status: 400 }
      );
    }

    // Create auth user with admin client
    const adminClient = createAdminClient();
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          employee_id,
          role: role || "employee",
        },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Update profile with extra fields
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        department: department || "",
        position: position || "",
        role: role || "employee",
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    return NextResponse.json({ data: authData.user }, { status: 201 });
  } catch (error) {
    console.error("POST employees error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
