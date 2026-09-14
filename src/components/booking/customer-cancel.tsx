"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import { customerRefundMessage } from "@/lib/booking/cancellation";
import type { BookingStatus } from "@/types";

const CANCELLABLE: BookingStatus[] = [
  "REQUESTED",
  "HELD",
  "ADMIN_APPROVED",
  "PAYMENT_PENDING",
  "CONFIRMED",
];

export function CustomerCancelButton({
  bookingId,
  status,
  eventDate,
  advancePaid,
}: {
  bookingId: string;
  status: BookingStatus;
  eventDate: string;
  advancePaid: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: "success" | "error" | "info" } | null>(null);

  if (!CANCELLABLE.includes(status)) return null;

  async function cancel() {
    const preview = customerRefundMessage(eventDate, advancePaid);
    if (!window.confirm(`${preview}\n\nCancel this booking?`)) return;

    setBusy(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not cancel.");
      setFeedback({
        title: "Booking cancelled",
        message: result.data?.message ?? preview,
        tone: "info",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        title: "Cancel failed",
        message: error instanceof Error ? error.message : "Could not cancel.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" className="h-11 w-full" onClick={cancel} disabled={busy}>
        {busy ? "Cancelling…" : "Cancel booking"}
      </Button>
      <FeedbackDialog
        open={!!feedback}
        title={feedback?.title ?? ""}
        message={feedback?.message ?? ""}
        tone={feedback?.tone ?? "info"}
        onClose={() => setFeedback(null)}
      />
    </>
  );
}
