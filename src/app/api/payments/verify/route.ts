import { NextResponse } from "next/server";

import {
  notifyAdminsOfPayment,
  notifyCustomerPaymentReceived,
  notifyCustomerStatusChange,
  sendCriticalStatusSms,
} from "@/lib/notifications/orchestrator";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const valid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!valid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: payment } = await supabase
      .from("payments")
      .update({
        payment_id: razorpay_payment_id,
        status: "CAPTURED",
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", razorpay_order_id)
        .select("*, bookings(*, customers(full_name, phone, whatsapp, email), packages(name))")
      .single();

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    await supabase
      .from("bookings")
      .update({ status: "CONFIRMED", hold_expires_at: null })
      .eq("id", booking_id);

    const booking = payment.bookings as {
      event_date: string;
      start_time: string;
      total: number;
      customers: { full_name: string; phone: string; whatsapp?: string; email?: string | null };
      packages: { name: string } | null;
    };

    const notificationContext = {
      bookingId: booking_id,
      customerName: booking.customers.full_name,
      customerPhone: booking.customers.whatsapp || booking.customers.phone,
      customerEmail: booking.customers.email,
      packageName: booking.packages?.name ?? "Makeup Service",
      date: booking.event_date,
      time: booking.start_time.slice(0, 5),
      total: String(booking.total),
      advance: String(payment.amount),
    };
    await Promise.allSettled([
      notifyCustomerPaymentReceived(notificationContext),
      notifyCustomerStatusChange(notificationContext, "CONFIRMED"),
      sendCriticalStatusSms(notificationContext, "CONFIRMED"),
      notifyAdminsOfPayment(notificationContext),
    ]);

    return NextResponse.json({ data: { success: true, booking_id } });
  } catch (err) {
    console.error("[payments/verify] error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
