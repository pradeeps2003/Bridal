import type { BookingStatus } from "@/types";

const labels: Record<BookingStatus | "DELIVERED" | "SENDING" | "FAILED", string> = {
  REQUESTED: "Pending",
  HELD: "Pending",
  ADMIN_APPROVED: "Approved",
  PAYMENT_PENDING: "Payment pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
  SENDING: "Sending",
  FAILED: "Failed",
};

export function StatusMark({ status }: { status: BookingStatus | "DELIVERED" | "SENDING" | "FAILED" }) {
  const tone = status === "FAILED" || status === "REJECTED" || status === "CANCELLED"
    ? "border-[var(--color-destructive)] text-[var(--color-destructive)]"
    : status === "CONFIRMED" || status === "COMPLETED" || status === "DELIVERED"
      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
      : status === "SENDING" || status === "HELD" || status === "REQUESTED" || status === "PAYMENT_PENDING"
        ? "border-[var(--color-accent)] text-[var(--color-accent)]"
        : "border-[var(--color-border)] text-[var(--color-muted-foreground)]";

  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span className={`h-2.5 w-2.5 border ${tone}`} aria-hidden="true" />
      <span>{labels[status]}</span>
    </span>
  );
}
