import { NextResponse } from "next/server";

import { getBookingById } from "@/lib/data/bookings";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/payments/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
  }

  try {
    const { booking_id } = await request.json();
    if (!booking_id) {
      return NextResponse.json({ error: "booking_id required" }, { status: 400 });
    }

    const booking = await getBookingById(booking_id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!["ADMIN_APPROVED", "PAYMENT_PENDING"].includes(booking.status)) {
      return NextResponse.json({ error: "Booking is not ready for payment" }, { status: 400 });
    }

    const amount = Number(booking.advance);
    if (amount <= 0) {
      return NextResponse.json({ error: "No advance payment required" }, { status: 400 });
    }

    const order = await createRazorpayOrder(amount, booking.id.slice(0, 8));
    const supabase = createAdminClient();

    await supabase.from("payments").insert({
      booking_id: booking.id,
      gateway: "razorpay",
      order_id: order.id,
      amount,
      status: "PENDING",
    });

    if (booking.status === "ADMIN_APPROVED") {
      await supabase
        .from("bookings")
        .update({ status: "PAYMENT_PENDING" })
        .eq("id", booking.id);
    }

    return NextResponse.json({
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        booking_id: booking.id,
      },
    });
  } catch (err) {
    console.error("[payments/create-order] error:", err);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
