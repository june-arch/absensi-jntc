import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export async function ensureProfileExists(user: User, metadata?: {
  full_name?: string;
  employee_id?: string;
  role?: string;
}) {
  const supabase = createClient();
  
  try {
    // Check if profile already exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      console.log("[PROFILE_UTILS] Profile already exists:", profile.id);
      return profile;
    }

    console.log("[PROFILE_UTILS] Profile not found, creating new profile...");
    
    // Create profile if it doesn't exist (now allowed by RLS policy)
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: metadata?.full_name || user.user_metadata?.full_name || '',
        employee_id: metadata?.employee_id || user.user_metadata?.employee_id || `EMP-${user.id.slice(0, 8)}`,
        role: metadata?.role || user.user_metadata?.role || 'employee',
      })
      .select()
      .single();

    if (insertError) {
      console.log("[PROFILE_UTILS] Error creating profile:", insertError);
      throw insertError;
    }

    console.log("[PROFILE_UTILS] Profile created successfully:", newProfile.id);
    return newProfile;
    
  } catch (error) {
    console.log("[PROFILE_UTILS] Profile creation failed:", error);
    throw error;
  }
}
