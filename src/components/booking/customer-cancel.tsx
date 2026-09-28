"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { CircleAlert, X } from "lucide-react";

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

  const previewMessage = customerRefundMessage(eventDate, advancePaid);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!CANCELLABLE.includes(status)) return null;

  async function proceedWithCancel() {
    setShowConfirm(false);
    setBusy(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not cancel.");
      setFeedback({
        title: "Booking cancelled",
        message: result.data?.message ?? previewMessage,
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
      <Button variant="outline" className="h-11 w-full" onClick={() => setShowConfirm(true)} disabled={busy}>
        {busy ? "Cancelling…" : "Cancel booking"}
      </Button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-[var(--color-card)] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30 shrink-0">
                  <CircleAlert className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">Cancel Booking</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)] leading-relaxed whitespace-pre-wrap">
                    {previewMessage}
                  </p>
                  <p className="mt-4 text-sm font-medium">Are you sure you want to cancel this booking?</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 bg-[var(--color-muted)]/30 px-6 py-4 justify-end">
              <Button variant="outline" type="button" onClick={() => setShowConfirm(false)}>
                No, go back
              </Button>
              <Button type="button" onClick={proceedWithCancel} className="bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-700">
                Yes, cancel booking
              </Button>
            </div>
          </div>
        </div>
      )}

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
