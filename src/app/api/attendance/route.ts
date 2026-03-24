import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Check if admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let query = supabase
      .from("attendance")
      .select(
        `
        *,
        profile:profiles(id, full_name, employee_id, department, position)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    // Non-admin can only see their own
    if (profile?.role !== "admin") {
      query = query.eq("user_id", user.id);
    } else if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET attendance error:", error);
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

    const body = await request.json();
    const { type, selfie_url, latitude, longitude, notes } = body;

    if (!type || !selfie_url) {
      return NextResponse.json(
        { error: "type and selfie_url are required" },
        { status: 400 }
      );
    }

    // Determine status: if check_in after 9AM, mark as late
    const now = new Date();
    let status: "present" | "late" = "present";
    if (type === "check_in" && now.getHours() >= 9) {
      status = "late";
    }

    const { data, error } = await supabase
      .from("attendance")
      .insert({
        user_id: user.id,
        type,
        status,
        selfie_url,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
