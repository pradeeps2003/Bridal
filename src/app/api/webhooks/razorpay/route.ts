import { NextResponse } from "next/server";

import {
  notifyAdminsOfPayment,
  notifyCustomerPaymentReceived,
  notifyCustomerStatusChange,
  sendCriticalStatusSms,
} from "@/lib/notifications/orchestrator";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const supabase = createAdminClient();

  await supabase.from("payment_events").insert({
    event_type: event.event,
    payload: event,
    processed: false,
  });

  if (event.event === "payment.captured") {
    const paymentEntity = event.payload.payment.entity;
    const orderId = paymentEntity.order_id;

    const { data: payment } = await supabase
      .from("payments")
      .update({
        payment_id: paymentEntity.id,
        status: "CAPTURED",
        payment_method: paymentEntity.method,
        metadata: paymentEntity,
      })
      .eq("order_id", orderId)
      .select("*, bookings(*, customers(full_name, phone, whatsapp, email), packages(name))")
      .single();

    if (payment?.booking_id) {
      await supabase
        .from("bookings")
        .update({ status: "CONFIRMED" })
        .eq("id", payment.booking_id);

      const booking = payment.bookings as {
        event_date: string;
        start_time: string;
        total: number;
        customers: { full_name: string; phone: string; whatsapp?: string; email?: string | null };
        packages: { name: string } | null;
      };

      const notificationContext = {
        bookingId: payment.booking_id,
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
    }
  }

  return NextResponse.json({ received: true });
}
