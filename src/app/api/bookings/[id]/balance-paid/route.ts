import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/data/admin";
import { getBookingById } from "@/lib/data/bookings";
import { logAudit } from "@/lib/data/settings";
import { captureBalancePayment, getBookingPayments, remainingBalance } from "@/lib/payments/confirm";
import type { BookingStatus } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await getCurrentAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const status = booking.status as BookingStatus;
  if (!["CONFIRMED", "COMPLETED"].includes(status)) {
    return NextResponse.json(
      { error: "Balance can be marked paid after the booking is confirmed." },
      { status: 400 },
    );
  }

  const payments = await getBookingPayments(id);
  const remaining = remainingBalance(Number(booking.total), payments);
  if (remaining <= 0) {
    return NextResponse.json({ data: { already: true, remaining: 0 } });
  }

  await captureBalancePayment(id, remaining, "admin");
  await logAudit(session.admin.id, "mark_balance_paid", "bookings", id, { amount: remaining });

  return NextResponse.json({ data: { remaining: 0, captured: remaining } });
}
