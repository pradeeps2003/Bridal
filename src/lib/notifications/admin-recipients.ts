import { createAdminClient } from "@/lib/supabase/admin";

export function adminBookingLink(bookingId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/admin/bookings/${bookingId}`;
}

export function paymentLink(bookingId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/book/confirmation/${bookingId}`;
}

export async function resolveAdminRecipients() {
  let adminPhone = "";
  let adminEmails: string[] = [];

  try {
    const supabase = createAdminClient();
    const [{ data: setting }, { data: admins }] = await Promise.all([
      supabase.from("site_settings").select("value").eq("key", "business").maybeSingle(),
      supabase.from("admins").select("email").eq("is_active", true),
    ]);
    const business = setting?.value as { whatsapp?: string; phone?: string; email?: string } | null;
    adminPhone = business?.whatsapp || business?.phone || "";
    adminEmails = [
      ...new Set(
        [business?.email ?? "", ...(admins ?? []).map((admin) => admin.email as string)]
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ];
  } catch (error) {
    console.warn("[notifications] Could not resolve admin recipients:", error);
  }

  return { adminPhone, adminEmails };
}
