import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/data/admin";
import { getBookingById } from "@/lib/data/bookings";
import { logAudit } from "@/lib/data/settings";
import {
  notifyCustomerPaymentReceived,
  notifyCustomerStatusChange,
  sendCriticalStatusSms,
} from "@/lib/notifications/orchestrator";
import { sendReviewRequest } from "@/lib/notifications/reviews";
import { capturePendingPayments } from "@/lib/payments/confirm";
import { assertTransition } from "@/lib/booking/state-machine";
import { updateBookingStatusSchema } from "@/lib/booking/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingStatus } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ data: booking });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getCurrentAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateBookingStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("bookings")
      .select("*, customers(full_name, phone, whatsapp, email), packages(name)")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  try {
    assertTransition(existing.status as BookingStatus, parsed.data.status);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid transition" },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {
    status: parsed.data.status,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.admin_notes !== undefined) {
    updates.admin_notes = parsed.data.admin_notes;
  }
  if (parsed.data.discount !== undefined) {
    updates.discount = parsed.data.discount;
    updates.total = Math.max(
      0,
      Number(existing.subtotal) +
        Number(existing.addons_total) +
        Number(existing.travel_fee) -
        parsed.data.discount,
    );
    updates.balance = Math.max(0, Number(updates.total) - Number(existing.advance));
  }

  if (parsed.data.status === "PAYMENT_PENDING" || parsed.data.status === "ADMIN_APPROVED") {
    updates.hold_expires_at = null;
  }
  if (parsed.data.status === "CONFIRMED") {
    updates.hold_expires_at = null;
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  }

  await logAudit(session.admin.id, "update_status", "bookings", id, {
    from: existing.status,
    to: parsed.data.status,
  });

  const customer = existing.customers as {
    full_name: string;
    phone: string;
    whatsapp?: string;
    email?: string | null;
  };
  const pkg = existing.packages as { name: string } | null;
  const notificationContext = {
    bookingId: id,
    customerName: customer.full_name,
    customerPhone: customer.whatsapp || customer.phone,
    customerEmail: customer.email,
    packageName: pkg?.name ?? "Makeup Service",
    date: existing.event_date as string,
    time: (existing.start_time as string).slice(0, 5),
    advance: String(booking.advance),
    total: String(booking.total),
  };

  const captured = parsed.data.status === "CONFIRMED" ? await capturePendingPayments(id) : [];

  await Promise.allSettled([
    notifyCustomerStatusChange(notificationContext, parsed.data.status as BookingStatus),
    sendCriticalStatusSms(notificationContext, parsed.data.status as BookingStatus),
    captured.length
      ? notifyCustomerPaymentReceived(notificationContext)
      : Promise.resolve(),
    parsed.data.status === "COMPLETED" ? sendReviewRequest(id) : Promise.resolve(),
  ]);

  return NextResponse.json({ data: booking });
}
