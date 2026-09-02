import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationChannel, NotificationStatus } from "@/types";

interface LogNotificationInput {
  bookingId?: string;
  phone?: string | null;
  email?: string | null;
  channel: NotificationChannel;
  templateKey: string;
  message: string;
  status: NotificationStatus;
  sentAt?: string | null;
  error?: string | null;
  provider?: string | null;
}

export async function logNotification(input: LogNotificationInput) {
  try {
    const supabase = createAdminClient();
    await supabase.from("notifications").insert({
      booking_id: input.bookingId ?? null,
      // Kept populated for backwards compatibility with the original schema.
      recipient_phone: input.phone ?? "",
      recipient_email: input.email ?? null,
      channel: input.channel,
      template_key: input.templateKey,
      message_body: input.message,
      status: input.status,
      sent_at: input.sentAt ?? null,
      error: input.error ?? null,
      provider: input.provider ?? null,
    });
  } catch (error) {
    console.warn(`[${input.channel.toLowerCase()}] Failed to log notification:`, error);
  }
}
