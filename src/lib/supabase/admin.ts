import { createClient } from "@supabase/supabase-js";

import { getClientEnv, requireServerEnv } from "@/lib/env";

/** Service-role client for server-side operations that bypass RLS. Never expose to browser. */
export function createAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getClientEnv();
  if (!NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  return createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    requireServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
