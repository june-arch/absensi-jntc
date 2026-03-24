import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// This endpoint creates a superadmin user
// Uses service_role key to bypass RLS
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not set in .env.local" },
      { status: 500 }
    );
  }

  // Create admin client with service_role key (bypasses RLS)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const email = "official.juniko@gmail.com";
  const password = "password123";

  try {
    // 1. Create auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      // If user already exists, get the user
      if (authError.message.includes("already been registered")) {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users?.users?.find((u) => u.email === email);
        if (existingUser) {
          // Update profile to admin
          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ role: "admin" })
            .eq("id", existingUser.id);

          if (updateError) {
            // Profile might not exist, create it
            const { error: insertError } = await supabaseAdmin
              .from("profiles")
              .upsert({
                id: existingUser.id,
                email,
                full_name: "Super Admin",
                employee_id: "ADMIN-001",
                role: "admin",
              });

            if (insertError) {
              return NextResponse.json({ error: insertError.message }, { status: 500 });
            }
          }

          return NextResponse.json({
            message: "Existing user updated to admin",
            user_id: existingUser.id,
            email,
          });
        }
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 2. Create profile with admin role
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email,
        full_name: "Super Admin",
        employee_id: "ADMIN-001",
        role: "admin",
      });

    if (profileError) {
      return NextResponse.json(
        { error: `User created but profile failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Superadmin created successfully!",
      user_id: authData.user.id,
      email,
      role: "admin",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
