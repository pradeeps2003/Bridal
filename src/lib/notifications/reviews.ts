import { createAdminClient } from "@/lib/supabase/admin";
import { notifyFromTemplate } from "@/lib/notifications/whatsapp";
import type { NotificationResult } from "@/lib/notifications/types";

function newReviewToken() {
  return `${Math.random().toString(36).slice(2, 15)}${Math.random().toString(36).slice(2, 15)}`;
}

export async function sendReviewRequest(bookingId: string): Promise<NotificationResult | null> {
  const supabase = createAdminClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, review_token, review_requested_at, packages(name), customers(full_name, phone, whatsapp)")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.review_requested_at) return null;

  const customer = booking.customers as {
    full_name?: string;
    phone?: string;
    whatsapp?: string | null;
  } | null;
  const phone = customer?.whatsapp || customer?.phone;
  if (!phone) return null;

  let reviewToken = booking.review_token as string | null;
  if (!reviewToken) {
    reviewToken = newReviewToken();
  }

  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "business")
    .maybeSingle();
  const business = setting?.value as { google_review_url?: string | null } | null;
  const googleReviewUrl = business?.google_review_url?.trim() || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pkg = booking.packages as { name?: string } | null;

  const result = await notifyFromTemplate(
    "review_request",
    phone,
    {
      customer_name: customer?.full_name || "there",
      package: pkg?.name || "your booking",
      google_review_url: googleReviewUrl || `${appUrl}/testimonial?token=${reviewToken}`,
      testimonial_url: `${appUrl}/testimonial?token=${reviewToken}`,
    },
    bookingId,
  );

  await supabase
    .from("bookings")
    .update({
      review_token: reviewToken,
      review_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  return result;
}

export async function sendDueReviewRequests() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, status")
    .in("status", ["CONFIRMED", "COMPLETED"])
    .lt("event_date", today)
    .is("review_requested_at", null);

  if (error) throw error;

  let sent = 0;
  for (const booking of bookings ?? []) {
    if (booking.status === "CONFIRMED") {
      await supabase
        .from("bookings")
        .update({ status: "COMPLETED", updated_at: new Date().toISOString() })
        .eq("id", booking.id)
        .eq("status", "CONFIRMED");
    }
    const result = await sendReviewRequest(booking.id);
    if (result) sent += 1;
  }

  return { considered: bookings?.length ?? 0, sent };
}
