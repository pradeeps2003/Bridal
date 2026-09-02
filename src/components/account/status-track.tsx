import type { BookingStatus } from "@/types";

const TRACK: Array<{ status: BookingStatus; label: string }> = [
  { status: "HELD", label: "Pending" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "COMPLETED", label: "Completed" },
];

const ORDER: Record<BookingStatus, number> = {
  REQUESTED: 0,
  HELD: 0,
  ADMIN_APPROVED: 0,
  PAYMENT_PENDING: 0,
  CONFIRMED: 1,
  COMPLETED: 2,
  REJECTED: -1,
  EXPIRED: -1,
  CANCELLED: -1,
};

export function StatusTrack({ status }: { status: BookingStatus }) {
  const cancelled = status === "CANCELLED" || status === "REJECTED" || status === "EXPIRED";
  const current = ORDER[status];

  return (
    <div aria-label={`Booking status: ${status.replaceAll("_", " ")}`}>
      <div className="flex flex-col gap-0 sm:flex-row sm:items-start">
        {TRACK.map((item, index) => {
          const done = !cancelled && current > index;
          const active = !cancelled && current === index;
          return (
            <div key={item.status} className="flex flex-1 items-start sm:flex-col sm:items-stretch">
              <div className="flex flex-col items-center sm:flex-row sm:items-center">
                <span
                  className={`flex h-3 w-3 shrink-0 border ${
                    active
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                      : done
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--color-border)] bg-[var(--color-card)]"
                  }`}
                  aria-hidden="true"
                />
                {index < TRACK.length - 1 && (
                  <span className="h-8 w-px bg-[var(--color-border)] sm:h-px sm:w-full" aria-hidden="true" />
                )}
              </div>
              <span
                className={`pb-3 pl-3 text-xs sm:pt-2 sm:pl-0 ${
                  active ? "font-semibold text-[var(--color-accent)]" : "text-[var(--color-muted-foreground)]"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      {cancelled && (
        <div className="mt-2 flex items-center gap-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-destructive)]">
          <span className="h-3 w-3 border border-[var(--color-destructive)]" aria-hidden="true" />
          <span>{status === "REJECTED" ? "Not approved" : status === "EXPIRED" ? "Hold expired" : "Cancelled"}</span>
        </div>
      )}
    </div>
  );
}
