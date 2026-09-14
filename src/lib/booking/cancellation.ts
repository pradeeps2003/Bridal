const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const NO_REFUND_WINDOW_DAYS = 7;

export const CANCELLATION_POLICY_SUMMARY =
  "You can cancel your booking anytime. If you already paid an advance, refunds are decided by the studio. If the event is less than 7 days away, the advance is not returned (unless the studio chooses otherwise). Remaining balance is collected on the event day.";

export function daysUntilEvent(eventDate: string, from = new Date()): number {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const event = new Date(`${eventDate}T00:00:00`);
  return Math.round((event.getTime() - start.getTime()) / MS_PER_DAY);
}

export function isWithinNoRefundWindow(eventDate: string, from = new Date()): boolean {
  return daysUntilEvent(eventDate, from) < NO_REFUND_WINDOW_DAYS;
}

export function customerRefundMessage(eventDate: string, advancePaid: boolean): string {
  if (!advancePaid) {
    return "Your booking will be cancelled. No payment was captured, so nothing needs to be refunded.";
  }
  if (isWithinNoRefundWindow(eventDate)) {
    return "Your booking will be cancelled. Because the event is less than 7 days away, the advance is not returned under our policy. The studio may still choose to help in special cases.";
  }
  return "Your booking will be cancelled. Any advance refund is decided by the studio. We will review and contact you.";
}

export function adminRefundNote(eventDate: string, advancePaid: boolean, source: "customer" | "admin"): string {
  const days = daysUntilEvent(eventDate);
  const who = source === "customer" ? "Customer cancelled." : "Admin cancelled.";
  if (!advancePaid) {
    return `${who} No captured advance. Days until event: ${days}.`;
  }
  if (isWithinNoRefundWindow(eventDate)) {
    return `${who} Advance was paid. Event is in ${days} day(s) (under 7 days): policy is no advance return. Admin may still refund manually via UPI if they choose.`;
  }
  return `${who} Advance was paid. Event is in ${days} day(s). Please decide whether to send the advance back via UPI and tell the customer.`;
}
