import { createAdminClient } from "@/lib/supabase/admin";

export async function capturePendingPayments(bookingId: string) {
  const supabase = createAdminClient();
  const { data: pending } = await supabase
    .from("payments")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("status", "PENDING");

  if (!pending?.length) return [];

  const ids = pending.map((row) => row.id);
  await supabase
    .from("payments")
    .update({ status: "CAPTURED", updated_at: new Date().toISOString() })
    .in("id", ids);

  return ids;
}

export async function getBookingPayments(bookingId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("payments")
    .select("id, gateway, order_id, payment_id, amount, status, payment_method, metadata, created_at")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
