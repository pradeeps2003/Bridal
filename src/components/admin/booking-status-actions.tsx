"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@/types";

interface BookingAction {
  label: string;
  status: BookingStatus;
  variant?: "accent" | "outline";
}

export function BookingStatusActions({ bookingId, actions }: { bookingId: string; actions: BookingAction[] }) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<BookingStatus | null>(null);
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  async function updateStatus(status: BookingStatus) {
    setPendingStatus(status);
    setFeedback(null);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The booking status could not be updated.");
      router.refresh();
    } catch (error) {
      setFeedback({
        title: "Status update failed",
        message: error instanceof Error ? error.message : "The booking status could not be updated.",
      });
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 sm:gap-3" aria-live="polite">
        {actions.map((action) => (
          <Button
            key={`${action.status}-${action.label}`}
            type="button"
            variant={action.variant ?? "outline"}
            size="default"
            onClick={() => updateStatus(action.status)}
            disabled={pendingStatus !== null}
            className="min-h-[44px]"
          >
            {pendingStatus === action.status ? "Updating…" : action.label}
          </Button>
        ))}
      </div>
      <FeedbackDialog
        open={!!feedback}
        title={feedback?.title ?? ""}
        message={feedback?.message ?? ""}
        onClose={() => setFeedback(null)}
      />
    </>
  );
}
