import Link from "next/link";

import { RuledFrame } from "@/components/admin/ruled-frame";
import { StatusMark } from "@/components/admin/status-mark";
import { Button } from "@/components/ui/button";
import type { DeliveryLog } from "@/lib/notifications/types";

export function DeliveryHealth({
  summary,
  recent,
}: {
  summary: { delivered: number; sending: number; failed: number };
  recent: DeliveryLog[];
}) {
  return (
    <RuledFrame>
      <div className="flex items-end justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
        <div><p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">Notifications</p><h2 className="mt-1 font-[family-name:var(--font-heading)] text-2xl">Delivery health</h2></div>
        <Button variant="link" size="sm" asChild><Link href="/admin/settings/notifications">View delivery log</Link></Button>
      </div>
      <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] border-b border-[var(--color-border)]">
        <div className="px-4 py-4"><p className="text-[11px] text-[var(--color-muted-foreground)]">Delivered</p><p className="mt-1 font-[family-name:var(--font-heading)] text-2xl tabular-nums">{summary.delivered}</p></div>
        <div className="px-4 py-4"><p className="text-[11px] text-[var(--color-muted-foreground)]">Sending</p><p className="mt-1 font-[family-name:var(--font-heading)] text-2xl tabular-nums">{summary.sending}</p></div>
        <div className="px-4 py-4"><p className="text-[11px] text-[var(--color-muted-foreground)]">Failed</p><p className="mt-1 font-[family-name:var(--font-heading)] text-2xl tabular-nums">{summary.failed}</p></div>
      </div>
      {recent.length === 0 ? (
        <p className="px-5 py-8 text-sm text-[var(--color-muted-foreground)]">No notifications were sent in this range.</p>
      ) : (
        <div className="divide-y divide-[var(--color-border)]">
          {recent.slice(0, 5).map((event) => (
            <div key={event.id} className="grid gap-2 px-5 py-3 text-xs sm:grid-cols-[80px_1fr_auto] sm:items-center">
              <span className="font-medium">{event.channel}</span>
              <span className="min-w-0 truncate text-[var(--color-muted-foreground)]">{event.customerName ?? event.recipientEmail ?? event.recipientPhone ?? "Unassigned notification"}</span>
              <StatusMark status={event.status === "SENT" ? "DELIVERED" : event.status === "PENDING" ? "SENDING" : "FAILED"} />
            </div>
          ))}
        </div>
      )}
    </RuledFrame>
  );
}
