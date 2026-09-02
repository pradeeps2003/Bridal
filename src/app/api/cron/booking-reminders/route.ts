import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  notifyAdminsDecisionReminder,
  notifyAdminsUnpaidReminder,
  notifyCustomerPaymentReminder,
} from "@/lib/notifications/orchestrator";
import type { BookingNotificationContext } from "@/lib/notifications/types";

function authorize(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toContext(booking: {
  id: string;
  event_date: string;
  start_time: string;
  total: number;
  advance: number;
  customers:
    | { full_name: string; phone: string; whatsapp?: string | null; email?: string | null }
    | { full_name: string; phone: string; whatsapp?: string | null; email?: string | null }[]
    | null;
  packages: { name: string } | { name: string }[] | null;
}): BookingNotificationContext | null {
  const customer = firstRelation(booking.customers);
  if (!customer) return null;
  const pkg = firstRelation(booking.packages);
  return {
    bookingId: booking.id,
    customerName: customer.full_name,
    customerPhone: customer.whatsapp || customer.phone,
    customerEmail: customer.email,
    packageName: pkg?.name ?? "Makeup Service",
    date: booking.event_date,
    time: booking.start_time.slice(0, 5),
    total: String(booking.total),
    advance: String(booking.advance),
  };
}

async function alreadyNotified(bookingId: string, templateKey: string, sinceIso: string) {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("booking_id", bookingId)
    .eq("template_key", templateKey)
    .gte("created_at", sinceIso);
  return (count ?? 0) > 0;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const since = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
  const staleBefore = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: held } = await supabase
    .from("bookings")
    .select("id, event_date, start_time, total, advance, customers(full_name, phone, whatsapp, email), packages(name)")
    .in("status", ["REQUESTED", "HELD"])
    .lt("created_at", staleBefore);

  const { data: unpaid } = await supabase
    .from("bookings")
    .select("id, event_date, start_time, total, advance, customers(full_name, phone, whatsapp, email), packages(name)")
    .in("status", ["ADMIN_APPROVED", "PAYMENT_PENDING"])
    .lt("updated_at", staleBefore);

  let decisionReminders = 0;
  for (const booking of held ?? []) {
    const context = toContext(booking as Parameters<typeof toContext>[0]);
    if (!context) continue;
    if (await alreadyNotified(context.bookingId, "admin_decision_reminder", since)) continue;
    await notifyAdminsDecisionReminder(context);
    decisionReminders += 1;
  }

  let unpaidReminders = 0;
  for (const booking of unpaid ?? []) {
    const context = toContext(booking as Parameters<typeof toContext>[0]);
    if (!context) continue;
    if (await alreadyNotified(context.bookingId, "payment_reminder", since)) continue;
    await Promise.allSettled([
      notifyCustomerPaymentReminder(context),
      notifyAdminsUnpaidReminder(context),
    ]);
    unpaidReminders += 1;
  }

  return NextResponse.json({
    data: { decisionReminders, unpaidReminders },
  });
}

export async function POST(request: Request) {
  return GET(request);
}
