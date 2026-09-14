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

export function remainingBalance(
  total: number,
  payments: Array<{ amount: number | string; status: string }>,
) {
  const captured = payments
    .filter((row) => row.status === "CAPTURED")
    .reduce((sum, row) => sum + Number(row.amount), 0);
  return Math.max(0, Number(total) - captured);
}

export async function captureBalancePayment(
  bookingId: string,
  amount: number,
  source: "admin" | "auto_week",
) {
  if (amount <= 0) return null;
  const supabase = createAdminClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      booking_id: bookingId,
      gateway: "cash",
      amount,
      currency: "INR",
      status: "CAPTURED",
      payment_method: "balance",
      metadata: { source, kind: "event_balance" },
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("bookings")
    .update({
      balance: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  return payment;
}

export async function autoCaptureOverdueBalances() {
  const supabase = createAdminClient();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, total, balance, event_date, status")
    .in("status", ["CONFIRMED", "COMPLETED"])
    .lte("event_date", cutoffDate);

  let captured = 0;
  for (const booking of bookings ?? []) {
    const payments = await getBookingPayments(booking.id);
    const remaining = remainingBalance(Number(booking.total), payments);
    if (remaining <= 0) continue;
    await captureBalancePayment(booking.id, remaining, "auto_week");
    captured += 1;
  }
  return captured;
}
