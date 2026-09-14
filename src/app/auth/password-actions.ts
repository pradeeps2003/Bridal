"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function requestPasswordResetAction(
  _prev: { error: string | null; success: boolean },
  formData: FormData,
) {
  if (!isSupabaseConfigured()) {
    return { error: "Login is not connected yet.", success: false };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter the email on your account.", success: false };

  const appUrl = process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function updatePasswordAction(
  _prev: { error: string | null; success: boolean },
  formData: FormData,
) {
  if (!isSupabaseConfigured()) {
    return { error: "Login is not connected yet.", success: false };
  }

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      error: "Could not update password. Open the latest reset link from your email, then try again.",
      success: false,
    };
  }
  return { error: null, success: true };
}
