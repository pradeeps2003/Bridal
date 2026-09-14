"use server";

import { redirect } from "next/navigation";

import { parseAdminLoginFields } from "@/lib/auth/admin-login";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function adminLoginAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the server." };
  }

  const parsed = parseAdminLoginFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const { email, password, redirectTo } = parsed;

  const supabase = await createClient();

  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !authData.user) {
    return { error: signInError?.message ?? "Sign in failed. Please try again." };
  }

  // Verify the user exists in the admins table and is active
  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("id, is_active")
    .eq("id", authData.user.id)
    .eq("is_active", true)
    .single();

  if (adminError || !admin) {
    await supabase.auth.signOut();
    return { error: "This account is not authorized for admin access." };
  }

  // Session cookie is now set server-side — safe to redirect
  redirect(redirectTo);
}
