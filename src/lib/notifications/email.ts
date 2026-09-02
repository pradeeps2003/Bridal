import { getServerEnv } from "@/lib/env";
import { logNotification } from "@/lib/notifications/log";
import type { NotificationResult } from "@/lib/notifications/types";

interface SendEmailInput {
  to: string;
  subject: string;
  message: string;
  bookingId?: string;
  templateKey?: string;
}

export function isEmailConfigured() {
  const env = getServerEnv();
  return Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
}

export async function sendEmailNotification(input: SendEmailInput): Promise<NotificationResult> {
  const env = getServerEnv();
  let status: "SENT" | "FAILED" | "PENDING" = "PENDING";
  let error: string | null = null;

  if (!input.to.trim()) {
    status = "FAILED";
    error = "No email recipient was provided";
  } else if (env.RESEND_API_KEY && env.RESEND_FROM_EMAIL) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.RESEND_FROM_EMAIL,
          to: [input.to],
          subject: input.subject,
          text: input.message,
        }),
      });

      if (response.ok) {
        status = "SENT";
      } else {
        status = "FAILED";
        error = await response.text();
      }
    } catch (cause) {
      status = "FAILED";
      error = cause instanceof Error ? cause.message : "Email provider request failed";
    }
  } else {
    console.info("[email] Not configured — message logged only:", input.subject);
  }

  await logNotification({
    bookingId: input.bookingId,
    email: input.to,
    channel: "EMAIL",
    templateKey: input.templateKey ?? "manual",
    message: input.message,
    status,
    sentAt: status === "SENT" ? new Date().toISOString() : null,
    error,
    provider: "resend",
  });

  return {
    channel: "EMAIL",
    success: status === "SENT",
    status,
    error: error ?? undefined,
  };
}
