"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@/types";

import { MessageCircle } from "lucide-react";

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
}

export function BookingStatusActions({ bookingId, actions, customerPhone, customerName }: BookingStatusActionsProps) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<BookingStatus | null>(null);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: "success" | "error" | "info" } | null>(null);

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
        CANCELLED: "Booking has been cancelled. Revenue total updated.",
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
        {customerPhone && (
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
        )}
      </div>
      <FeedbackDialog
        open={!!feedback}
        title={feedback?.title ?? ""}
        message={feedback?.message ?? ""}
        tone={feedback?.tone ?? "success"}
        autoClose={true}
        autoCloseDuration={5000}
        onClose={() => setFeedback(null)}
      />
    </>
  );
}
