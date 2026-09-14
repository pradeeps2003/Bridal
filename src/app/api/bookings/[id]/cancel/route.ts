import { NextResponse } from "next/server";

import {
  adminRefundNote,
  customerRefundMessage,
  isWithinNoRefundWindow,
} from "@/lib/booking/cancellation";
import { assertTransition } from "@/lib/booking/state-machine";
import { getPublicBooking } from "@/lib/data/bookings";
import {
  notifyAdminsCancelRefundReview,
  notifyCustomerStatusChange,
  sendCriticalStatusSms,
} from "@/lib/notifications/orchestrator";
import { getBookingPayments } from "@/lib/payments/confirm";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingStatus } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const CANCELLABLE: BookingStatus[] = [
  "REQUESTED",
  "HELD",
  "ADMIN_APPROVED",
  "PAYMENT_PENDING",
  "CONFIRMED",
];

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const booking = await getPublicBooking(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const status = booking.status as BookingStatus;
  if (status === "CANCELLED") {
    return NextResponse.json({ data: { status, already: true, message: "This booking is already cancelled." } });
  }
  if (!CANCELLABLE.includes(status)) {
    return NextResponse.json(
      { error: "This booking can no longer be cancelled online." },
      { status: 400 },
    );
  }

  try {
    assertTransition(status, "CANCELLED");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cannot cancel" },
      { status: 400 },
    );
  }

  const payments = await getBookingPayments(id).catch(() => []);
  const captured = payments.filter((p) => p.status === "CAPTURED");
  const advancePaid = captured.reduce((sum, p) => sum + Number(p.amount), 0) > 0;
  const refundNote = adminRefundNote(booking.event_date, advancePaid, "customer");
  const customerMessage = customerRefundMessage(booking.event_date, advancePaid);

  const supabase = createAdminClient();
  const previousNotes = typeof booking.admin_notes === "string" ? booking.admin_notes : "";
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "CANCELLED",
      hold_expires_at: null,
      admin_notes: [previousNotes, refundNote].filter(Boolean).join("\n"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Cancel failed" }, { status: 500 });
  }

  const customer = booking.customers as {
    full_name?: string;
    phone?: string;
    whatsapp?: string;
    email?: string | null;
  } | undefined;
  const pkg = booking.packages as { name?: string } | undefined;
  const notificationContext = {
    bookingId: id,
    customerName: customer?.full_name ?? "Customer",
    customerPhone: customer?.whatsapp || customer?.phone || "",
    customerEmail: customer?.email,
    packageName: pkg?.name ?? "Makeup Service",
    date: booking.event_date,
    time: booking.start_time.slice(0, 5),
    advance: String(booking.advance),
    total: String(booking.total),
  };

  await Promise.allSettled([
    notifyCustomerStatusChange(notificationContext, "CANCELLED"),
    sendCriticalStatusSms(notificationContext, "CANCELLED"),
    advancePaid
      ? notifyAdminsCancelRefundReview({ ...notificationContext, refundNote })
      : Promise.resolve(),
  ]);

  return NextResponse.json({
    data: {
      status: "CANCELLED",
      message: customerMessage,
      advancePaid,
      noRefundByPolicy: advancePaid && isWithinNoRefundWindow(booking.event_date),
    },
  });
}
