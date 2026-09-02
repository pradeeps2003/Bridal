import { notifyFromTemplate } from "@/lib/notifications/whatsapp";
import { sendEmailNotification } from "@/lib/notifications/email";
import { sendSmsNotification } from "@/lib/notifications/sms";
import {
  adminBookingLink,
  paymentLink,
  resolveAdminRecipients,
} from "@/lib/notifications/admin-recipients";
import type { BookingStatus } from "@/types";
import type {
  BookingNotificationContext,
  NotificationResult,
} from "@/lib/notifications/types";

const STATUS_TEMPLATES: Partial<Record<BookingStatus, { key: string; subject: string }>> = {
  ADMIN_APPROVED: { key: "booking_approved", subject: "Your Glow with Rubi booking is approved" },
  PAYMENT_PENDING: { key: "booking_approved", subject: "Payment is due for your Glow with Rubi booking" },
  CONFIRMED: { key: "booking_confirmed", subject: "Your Glow with Rubi booking is confirmed" },
  REJECTED: { key: "booking_rejected", subject: "An update about your Glow with Rubi booking" },
  CANCELLED: { key: "booking_cancelled", subject: "Your Glow with Rubi booking was cancelled" },
};

const CRITICAL_STATUSES = new Set<BookingStatus>(["CONFIRMED", "REJECTED", "CANCELLED"]);

async function deliverCustomerTemplate(
  input: BookingNotificationContext,
  templateKey: string,
  subject: string,
  vars: Record<string, string>,
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];
  let whatsappResult: NotificationResult | null = null;

  if (input.customerPhone.trim()) {
    whatsappResult = await notifyFromTemplate(
      templateKey,
      input.customerPhone,
      vars,
      input.bookingId,
    );
    results.push(whatsappResult);
  }

  if (!whatsappResult?.success && input.customerEmail) {
    results.push(
      await sendEmailNotification({
        to: input.customerEmail,
        subject,
        message: await renderMessage(templateKey, vars),
        bookingId: input.bookingId,
        templateKey,
      }),
    );
  }

  return results;
}

async function renderMessage(templateKey: string, vars: Record<string, string>) {
  const { renderTemplate } = await import("@/lib/notifications/whatsapp");
  return (
    (await renderTemplate(templateKey, vars)) ??
    `Glow with Rubi: ${templateKey} — ${Object.values(vars).join(", ")}`
  );
}

async function notifyAdmins(input: {
  bookingId?: string;
  templateKey: string;
  subject: string;
  vars: Record<string, string>;
}): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];
  const { adminPhone, adminEmails } = await resolveAdminRecipients();
  let whatsappResult: NotificationResult | null = null;

  if (adminPhone) {
    whatsappResult = await notifyFromTemplate(
      input.templateKey,
      adminPhone,
      input.vars,
      input.bookingId,
    );
    results.push(whatsappResult);
  }

  if (!whatsappResult?.success) {
    const message = await renderMessage(input.templateKey, input.vars);
    const emailResults = await Promise.all(
      adminEmails.map((to) =>
        sendEmailNotification({
          to,
          subject: input.subject,
          message,
          bookingId: input.bookingId,
          templateKey: input.templateKey,
        }),
      ),
    );
    results.push(...emailResults);
  }

  return results;
}

function bookingVars(input: BookingNotificationContext) {
  return {
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    package: input.packageName,
    date: input.date,
    time: input.time,
    total: input.total ?? "—",
    advance: input.advance ?? "—",
    amount: input.advance ?? input.total ?? "—",
    payment_link: paymentLink(input.bookingId),
    admin_link: adminBookingLink(input.bookingId),
  };
}

export async function notifyNewBooking(input: BookingNotificationContext) {
  const customerResults = await deliverCustomerTemplate(
    input,
    "booking_received",
    "We received your Glow with Rubi booking request",
    bookingVars(input),
  );
  const adminResults = await notifyAdminsOfNewBooking(input);
  return [...customerResults, ...adminResults];
}

export async function notifyAdminsOfNewBooking(input: BookingNotificationContext) {
  return notifyAdmins({
    bookingId: input.bookingId,
    templateKey: "admin_new_request",
    subject: `Please decide: new booking from ${input.customerName}`,
    vars: bookingVars(input),
  });
}

export async function notifyAdminsOfPayment(input: BookingNotificationContext) {
  return notifyAdmins({
    bookingId: input.bookingId,
    templateKey: "admin_payment_received",
    subject: `Advance captured from ${input.customerName}`,
    vars: bookingVars(input),
  });
}

export async function notifyAdminsOfUpiReceipt(
  input: BookingNotificationContext,
  utr: string,
) {
  return notifyAdmins({
    bookingId: input.bookingId,
    templateKey: "admin_upi_verify",
    subject: `Please verify UPI payment from ${input.customerName}`,
    vars: { ...bookingVars(input), utr },
  });
}

export async function notifyAdminsOfEnquiry(input: {
  name: string;
  phone: string;
  message: string;
}) {
  const vars = {
    customer_name: input.name,
    customer_phone: input.phone,
    message: input.message,
    package: "enquiry",
    date: new Date().toISOString().slice(0, 10),
    time: "",
    admin_link: `${(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/admin/enquiries`,
  };
  return notifyAdmins({
    templateKey: "contact_enquiry",
    subject: `New contact enquiry from ${input.name}`,
    vars,
  });
}

export async function notifyCustomerStatusChange(
  input: BookingNotificationContext,
  status: BookingStatus,
) {
  const template = STATUS_TEMPLATES[status];
  if (!template) return [];
  return deliverCustomerTemplate(input, template.key, template.subject, bookingVars(input));
}

export async function notifyCustomerPaymentReceived(input: BookingNotificationContext) {
  return deliverCustomerTemplate(
    input,
    "payment_received",
    "Payment received for your Glow with Rubi booking",
    bookingVars(input),
  );
}

export async function notifyCustomerUpiSubmitted(
  input: BookingNotificationContext,
  utr: string,
) {
  return deliverCustomerTemplate(
    input,
    "upi_payment_submitted",
    "We received your UPI payment details",
    { ...bookingVars(input), utr },
  );
}

export async function notifyCustomerPaymentReminder(input: BookingNotificationContext) {
  return deliverCustomerTemplate(
    input,
    "payment_reminder",
    "Please pay the advance for your Glow with Rubi booking",
    bookingVars(input),
  );
}

export async function notifyAdminsDecisionReminder(input: BookingNotificationContext) {
  return notifyAdmins({
    bookingId: input.bookingId,
    templateKey: "admin_decision_reminder",
    subject: `Reminder: decide on ${input.customerName}'s booking`,
    vars: bookingVars(input),
  });
}

export async function notifyAdminsUnpaidReminder(input: BookingNotificationContext) {
  return notifyAdmins({
    bookingId: input.bookingId,
    templateKey: "admin_unpaid_reminder",
    subject: `Reminder: unpaid advance from ${input.customerName}`,
    vars: bookingVars(input),
  });
}

export async function sendCriticalStatusSms(
  input: BookingNotificationContext,
  status: BookingStatus,
) {
  if (!CRITICAL_STATUSES.has(status) || !input.customerPhone.trim()) return null;

  const messageByStatus: Record<string, string> = {
    CONFIRMED: `Glow with Rubi: your ${input.packageName} booking on ${input.date} at ${input.time} is confirmed.`,
    REJECTED: `Glow with Rubi: your booking request for ${input.date} could not be approved. Please contact us for help.`,
    CANCELLED: `Glow with Rubi: your booking for ${input.date} at ${input.time} has been cancelled. Please contact us if you have questions.`,
  };

  return sendSmsNotification({
    phone: input.customerPhone,
    message: messageByStatus[status],
    bookingId: input.bookingId,
    templateKey: `booking_${status.toLowerCase()}`,
  });
}
