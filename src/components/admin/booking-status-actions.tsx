"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@/types";

import { CircleAlert, MessageCircle } from "lucide-react";

interface BookingAction {
  label: string;
  status: BookingStatus;
  variant?: "accent" | "outline";
}

interface BookingStatusActionsProps {
  bookingId: string;
  actions: BookingAction[];
  customerPhone?: string;
  customerName?: string;
  remainingBalance?: number;
}

export function BookingStatusActions({
  bookingId,
  actions,
  customerPhone,
  customerName,
  remainingBalance = 0,
}: BookingStatusActionsProps) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<BookingStatus | "BALANCE" | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: "success" | "error" | "info" } | null>(null);

  async function updateStatus(status: BookingStatus) {
    if (status === "CANCELLED" && !showConfirmCancel) {
      setShowConfirmCancel(true);
      return;
    }
    if (status === "CANCELLED" && showConfirmCancel) {
      setShowConfirmCancel(false);
    }

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

      const titleMap: Record<string, string> = {
        ADMIN_APPROVED: "Booking Approved ✓",
        REJECTED: "Booking Rejected",
        CANCELLED: "Booking Cancelled",
        CONFIRMED: "Booking Confirmed ✓",
        COMPLETED: "Booking Completed ✓",
      };

      const messageMap: Record<string, string> = {
        ADMIN_APPROVED: "Booking has been approved successfully. You can notify the customer via WhatsApp below.",
        REJECTED: "Booking has been rejected.",
        CANCELLED: "Booking has been cancelled.",
        CONFIRMED: "Booking and payment confirmed successfully.",
        COMPLETED: "Service completed successfully.",
      };

      setFeedback({
        title: titleMap[status] || "Status Updated",
        message: messageMap[status] || `Booking status updated to ${status.replace("_", " ").toLowerCase()}.`,
        tone: status === "CANCELLED" || status === "REJECTED" ? "info" : "success",
      });

      router.refresh();
    } catch (error) {
      setFeedback({
        title: "Status update failed",
        message: error instanceof Error ? error.message : "The booking status could not be updated.",
        tone: "error",
      });
    } finally {
      setPendingStatus(null);
    }
  }

  async function markBalancePaid() {
    setPendingStatus("BALANCE");
    setFeedback(null);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/balance-paid`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not mark balance paid.");
      setFeedback({
        title: "Balance marked paid",
        message: "That amount is now included in revenue.",
        tone: "success",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        title: "Could not mark paid",
        message: error instanceof Error ? error.message : "Try again.",
        tone: "error",
      });
    } finally {
      setPendingStatus(null);
    }
  }

  function handleSendWhatsAppUpdate() {
    if (!customerPhone) return;
    const cleanPhone = customerPhone.replace(/\D/g, "");
    const phoneNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const trackingUrl = `${window.location.origin}/book/confirmation/${bookingId}`;
    const text = encodeURIComponent(
      `Hi ${customerName || "there"}!\n\nUpdate on your booking (#${bookingId.slice(0, 8).toUpperCase()}):\nYou can check your live booking status and payment details here:\n${trackingUrl}`
    );
    window.open(`https://wa.me/${phoneNum}?text=${text}`, "_blank");
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3" aria-live="polite">
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
            {pendingStatus === action.status ? "Updating..." : action.label}
          </Button>
        ))}
        {remainingBalance > 0 ? (
          <Button
            type="button"
            variant="accent"
            size="default"
            onClick={markBalancePaid}
            disabled={pendingStatus !== null}
            className="min-h-[44px]"
          >
            {pendingStatus === "BALANCE" ? "Saving..." : "Mark balance paid"}
          </Button>
        ) : null}
        {customerPhone ? (
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleSendWhatsAppUpdate}
            className="min-h-[44px] border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Send WhatsApp Update
          </Button>
        ) : null}
      </div>
      {/* Admin Cancellation Modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-[var(--color-card)] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30 shrink-0">
                  <CircleAlert className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">Cancel Booking</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                    Are you sure you want to cancel this booking? This action will release the date, and the customer will be notified.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 bg-[var(--color-muted)]/30 px-6 py-4 justify-end">
              <Button variant="outline" type="button" onClick={() => setShowConfirmCancel(false)}>
                go back
              </Button>
              <Button type="button" onClick={() => updateStatus("CANCELLED")} className="bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-700">
                Yes, cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <FeedbackDialog
        open={!!feedback}
        title={feedback?.title ?? ""}
        message={feedback?.message ?? ""}
        tone={feedback?.tone ?? "success"}
        autoClose={true}
        autoCloseDuration={3000}
        showDismissButton={true}
        onClose={() => setFeedback(null)}
      />
    </>
  );
}
