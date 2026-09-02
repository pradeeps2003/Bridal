import { NextResponse } from "next/server";
import { z } from "zod";

import {
  notifyAdminsOfUpiReceipt,
  notifyCustomerUpiSubmitted,
} from "@/lib/notifications/orchestrator";
import { getPublicBooking } from "@/lib/data/bookings";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  booking_id: z.string().uuid(),
  utr: z.string().trim().min(4).max(40),
});

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const parsed = schema.safeParse({
      booking_id: form.get("booking_id"),
      utr: form.get("utr"),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter a valid UTR / UPI reference" }, { status: 400 });
    }

    const booking = await getPublicBooking(parsed.data.booking_id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (!["ADMIN_APPROVED", "PAYMENT_PENDING"].includes(booking.status)) {
      return NextResponse.json({ error: "This booking is not waiting for payment" }, { status: 400 });
    }

    const supabase = createAdminClient();
    let proofUrl: string | null = null;
    const screenshot = form.get("screenshot");

    if (screenshot instanceof File && screenshot.size > 0) {
      if (screenshot.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Screenshot must be under 5MB" }, { status: 400 });
      }
      const ext = screenshot.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${parsed.data.booking_id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, screenshot, { contentType: screenshot.type, upsert: true });
      if (!uploadError) {
        const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);
        proofUrl = data.publicUrl;
      } else {
        console.warn("[upi] screenshot upload failed:", uploadError.message);
      }
    }

    await supabase.from("payments").insert({
      booking_id: parsed.data.booking_id,
      gateway: "upi",
      amount: Number(booking.advance),
      status: "PENDING",
      payment_method: "upi",
      payment_id: parsed.data.utr,
      metadata: { utr: parsed.data.utr, proof_url: proofUrl },
    });

    if (booking.status === "ADMIN_APPROVED") {
      await supabase
        .from("bookings")
        .update({ status: "PAYMENT_PENDING", hold_expires_at: null, updated_at: new Date().toISOString() })
        .eq("id", parsed.data.booking_id);
    }

    const customer = booking.customers as {
      full_name?: string;
      phone?: string;
      whatsapp?: string;
    } | undefined;
    const pkg = booking.packages as { name?: string } | undefined;
    const context = {
      bookingId: parsed.data.booking_id,
      customerName: customer?.full_name ?? "Customer",
      customerPhone: customer?.whatsapp || customer?.phone || "",
      customerEmail: null,
      packageName: pkg?.name ?? "Makeup Service",
      date: booking.event_date,
      time: booking.start_time.slice(0, 5),
      total: String(booking.total),
      advance: String(booking.advance),
    };

    await Promise.allSettled([
      notifyAdminsOfUpiReceipt(context, parsed.data.utr),
      notifyCustomerUpiSubmitted(context, parsed.data.utr),
    ]);

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    console.error("[payments/upi-report] error:", err);
    return NextResponse.json({ error: "Could not submit payment details" }, { status: 500 });
  }
}
