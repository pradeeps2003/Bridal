import { getServerEnv } from "@/lib/env";
import { logNotification } from "@/lib/notifications/log";
import type { NotificationResult } from "@/lib/notifications/types";

interface SendSmsInput {
  phone: string;
  message: string;
  bookingId?: string;
  templateKey?: string;
}

export function normalizeE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  return phone.trim().startsWith("+") ? phone.trim() : `+${digits}`;
}

export function isSmsConfigured() {
  const env = getServerEnv();
  return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER);
}

export async function sendSmsNotification(input: SendSmsInput): Promise<NotificationResult> {
  const env = getServerEnv();
  let status: "SENT" | "FAILED" | "PENDING" = "PENDING";
  let error: string | null = null;
  const recipient = normalizeE164(input.phone);

  if (!input.phone.trim()) {
    status = "FAILED";
    error = "No phone recipient was provided";
  } else if (
    env.TWILIO_ACCOUNT_SID &&
    env.TWILIO_AUTH_TOKEN &&
    env.TWILIO_FROM_NUMBER
  ) {
    try {
      const credentials = Buffer.from(
        `${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`,
      ).toString("base64");
      const body = new URLSearchParams({
        To: recipient,
        From: env.TWILIO_FROM_NUMBER,
        Body: input.message,
      });
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        },
      );

      if (response.ok) {
        status = "SENT";
      } else {
        status = "FAILED";
        error = await response.text();
      }
    } catch (cause) {
      status = "FAILED";
      error = cause instanceof Error ? cause.message : "SMS provider request failed";
    }
  } else {
    console.info("[sms] Not configured — message logged only:", input.message);
  }

  await logNotification({
    bookingId: input.bookingId,
    phone: recipient,
    channel: "SMS",
    templateKey: input.templateKey ?? "manual",
    message: input.message,
    status,
    sentAt: status === "SENT" ? new Date().toISOString() : null,
    error,
    provider: "twilio",
  });

  return {
    channel: "SMS",
    success: status === "SENT",
    status,
    error: error ?? undefined,
  };
}
