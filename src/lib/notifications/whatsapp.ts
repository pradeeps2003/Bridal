import { logNotification } from "@/lib/notifications/log";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationResult } from "@/lib/notifications/types";

/** Cloud API delivery is intentionally disabled; bookings use manual wa.me links. */
export function isWhatsAppConfigured(): boolean {
  return false;
}

export interface SendWhatsAppInput {
  phone: string;
  message: string;
  bookingId?: string;
  templateKey?: string;
  templateName?: string;
   templateComponents?: unknown[];
}


/**
 * Keeps server-side notification callers compatible while guaranteeing that
 * no WhatsApp provider request is made. Customers send the prepared message
 * themselves through the booking page's wa.me link.
 */
export async function sendWhatsAppNotification(input: SendWhatsAppInput): Promise<NotificationResult> {
  const phone = input.phone.replace(/\D/g, "");
  const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;
  const status = "PENDING" as const;

  console.info("[whatsapp] Manual wa.me mode — message logged only:", input.message);

  await logNotification({
    bookingId: input.bookingId,
    phone: formattedPhone,
    channel: "WHATSAPP",
    templateKey: input.templateKey ?? (input.templateName ?? "manual"),
    message: input.message,
    status,
    sentAt: null,
    error: null,
    provider: "manual-wa.me",
  });

  return {
    channel: "WHATSAPP",
    success: true,
    status,
  };
}

export async function renderTemplate(
  templateKey: string,
  vars: Record<string, string>,
): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("notification_templates")
      .select("body_template")
      .eq("template_key", templateKey)
      .eq("is_active", true)
      .single();

    if (!data?.body_template) return null;

    return Object.entries(vars).reduce(
      (body, [key, value]) => body.replaceAll(`{{${key}}}`, value),
      data.body_template as string,
    );
  } catch (err) {
    console.error("[whatsapp] Failed to render template:", err);
    return null;
  }
}

export async function notifyFromTemplate(
  templateKey: string,
  phone: string,
  vars: Record<string, string>,
  bookingId?: string,
): Promise<NotificationResult> {
  const message =
    (await renderTemplate(templateKey, vars)) ??
    `Glow with Rubi: ${templateKey} — ${Object.values(vars).join(", ")}`;

  return sendWhatsAppNotification({ phone, message, bookingId, templateKey });
}

/** Send WhatsApp message using approved template (for business messages) */
export async function sendTemplateMessage(
  templateName: string,
  phone: string,
  components: unknown[],
  bookingId?: string,
): Promise<NotificationResult> {
  return sendWhatsAppNotification({
    phone,
    message: "",
    bookingId,
    templateName,
    templateComponents: components,
  });
}
