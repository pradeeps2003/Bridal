"use client";

import { useState } from "react";

import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/booking/state-machine";
import type { BookingStatus } from "@/types";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface PayNowButtonProps {
  bookingId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  razorpayKeyId: string;
}

export function PayNowButton({
  bookingId,
  amount,
  customerName,
  customerPhone,
  razorpayKeyId,
}: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.error ?? "Failed to create order");

      const { order_id } = orderJson.data;

      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: orderJson.data.amount,
        currency: "INR",
        name: "Glow with Rubi",
        description: "Booking advance payment",
        order_id,
        prefill: { name: customerName, contact: customerPhone },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              booking_id: bookingId,
            }),
          });
          if (verifyRes.ok) {
            window.location.reload();
          } else {
            setError("Payment verification failed. Contact us with your payment ID.");
          }
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="accent" onClick={handlePay} disabled={loading}>
        {loading ? "Processing…" : `Pay Advance ${formatCurrency(amount)}`}
      </Button>
      <FeedbackDialog
        open={!!error}
        title="Payment could not be completed"
        message={error ?? "Please try again."}
        onClose={() => setError(null)}
      />
    </div>
  );
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const colors: Record<BookingStatus, string> = {
    REQUESTED: "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30",
    HELD: "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30",
    ADMIN_APPROVED: "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30",
    PAYMENT_PENDING: "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30",
    CONFIRMED: "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30",
    REJECTED: "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] border border-[var(--color-destructive)]/30",
    EXPIRED: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)]",
    CANCELLED: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)]",
    COMPLETED: "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30",
  };

  return (
    <span className={`inline-flex rounded-sm px-3 py-1 text-sm font-medium ${colors[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
