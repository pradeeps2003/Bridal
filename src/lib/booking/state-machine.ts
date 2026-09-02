import type { BookingStatus } from "@/types";

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ["HELD", "ADMIN_APPROVED", "REJECTED", "CANCELLED"],
  HELD: ["ADMIN_APPROVED", "EXPIRED", "CANCELLED", "REQUESTED"],
  ADMIN_APPROVED: ["PAYMENT_PENDING", "CONFIRMED", "CANCELLED", "REJECTED"],
  PAYMENT_PENDING: ["CONFIRMED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  REJECTED: [],
  EXPIRED: ["REQUESTED"],
  CANCELLED: [],
  COMPLETED: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid booking transition: ${from} → ${to}`);
  }
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  REQUESTED: "Requested",
  HELD: "On Hold",
  ADMIN_APPROVED: "Approved",
  PAYMENT_PENDING: "Awaiting Payment",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  REQUESTED: "bg-blue-100 text-blue-800",
  HELD: "bg-amber-100 text-amber-800",
  ADMIN_APPROVED: "bg-purple-100 text-purple-800",
  PAYMENT_PENDING: "bg-orange-100 text-orange-800",
  CONFIRMED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-stone-100 text-stone-600",
  CANCELLED: "bg-stone-100 text-stone-600",
  COMPLETED: "bg-emerald-100 text-emerald-800",
};
