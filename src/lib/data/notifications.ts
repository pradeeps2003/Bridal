import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { NotificationStatus } from "@/types";
import type { DeliveryLog } from "@/lib/notifications/types";

export async function getNotificationDelivery(limit = 20): Promise<DeliveryLog[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("notifications")
      .select("id, booking_id, channel, status, recipient_phone, recipient_email, template_key, created_at, sent_at, error, bookings(customers(full_name))")
      .order("created_at", { ascending: false })
      .limit(limit);

    return (data ?? []).map((row) => {
      const booking = row.bookings as { customers?: { full_name?: string | null } | null } | null;
      return {
        id: row.id as string,
        bookingId: (row.booking_id as string | null) ?? null,
        customerName: booking?.customers?.full_name ?? null,
        channel: row.channel as DeliveryLog["channel"],
        status: row.status as NotificationStatus,
        recipientPhone: (row.recipient_phone as string | null) ?? null,
        recipientEmail: (row.recipient_email as string | null) ?? null,
        templateKey: row.template_key as string,
        createdAt: row.created_at as string,
        sentAt: (row.sent_at as string | null) ?? null,
        error: (row.error as string | null) ?? null,
      };
    });
  } catch (error) {
    console.warn("[notifications] delivery query failed:", error);
    return [];
  }
}

export function getDeliverySummary(delivery: DeliveryLog[]) {
  return delivery.reduce(
    (summary, event) => {
      if (event.status === "SENT") summary.delivered += 1;
      if (event.status === "PENDING") summary.sending += 1;
      if (event.status === "FAILED") summary.failed += 1;
      return summary;
    },
    { delivered: 0, sending: 0, failed: 0 },
  );
}
