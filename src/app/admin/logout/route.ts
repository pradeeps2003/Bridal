import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(
    new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  );

  // Clear all sb- cookies explicitly
  const cookieNames = ["sb-access-token", "sb-refresh-token"];
  cookieNames.forEach((name) => response.cookies.delete(name));

  return response;
}
