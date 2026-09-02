"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Clock3, CreditCard, MapPin } from "lucide-react";

import { AdminRealtime } from "@/components/admin/admin-realtime";
import { RuledFrame } from "@/components/admin/ruled-frame";
import { StatusMark } from "@/components/admin/status-mark";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

const filters: Array<{ label: string; value: "ALL" | BookingStatus }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "HELD" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function packageName(booking: Booking) {
  return (booking.packages as { name?: string } | undefined)?.name ?? "Custom booking";
}

export function BookingLedger({ bookings, date }: { bookings: Booking[]; date: string }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("ALL");
  const visible = useMemo(() => bookings.filter((booking) => {
    if (filter === "ALL") return true;
    if (filter === "HELD") return ["REQUESTED", "HELD", "ADMIN_APPROVED", "PAYMENT_PENDING"].includes(booking.status);
    return booking.status === filter;
  }), [bookings, filter]);

  return (
    <RuledFrame className="overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">Schedule</p>
          <h2 className="mt-1 font-[family-name:var(--font-heading)] text-xl sm:text-2xl">Today&apos;s bookings</h2>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{bookings.length} booking{bookings.length === 1 ? "" : "s"} scheduled for today</p>
        </div>
        <div className="flex items-center gap-3">
          <AdminRealtime eventDate={date} />
          <Button variant="link" size="sm" asChild>
            <Link href="/admin/bookings">View all bookings</Link>
          </Button>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto border-b border-[var(--color-border)] px-5" role="tablist" aria-label="Booking status filters">
        {filters.map((item) => (
          <button key={item.value} type="button" role="tab" aria-selected={filter === item.value} onClick={() => setFilter(item.value)} className={`shrink-0 border-b-2 py-3 text-xs transition-colors ${filter === item.value ? "border-[var(--color-accent)] text-[var(--color-foreground)]" : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"}`}>
            {item.label} <span className="tabular-nums">({item.value === "ALL" ? bookings.length : item.value === "HELD" ? bookings.filter((booking) => ["REQUESTED", "HELD", "ADMIN_APPROVED", "PAYMENT_PENDING"].includes(booking.status)).length : bookings.filter((booking) => booking.status === item.value).length})</span>
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[var(--color-muted-foreground)]">No bookings on this date.</p>
      ) : (
        <div className="divide-y divide-[var(--color-border)]">
          <div className="hidden grid-cols-[88px_1.3fr_1fr_0.8fr_0.7fr_auto] gap-4 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)] lg:grid"><span>Time</span><span>Customer</span><span>Booking</span><span>Location</span><span>Total</span><span>Status</span></div>
          {visible.map((booking) => {
            const customer = booking.customers as { full_name?: string; phone?: string } | undefined;
            return (
              <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="grid gap-3 px-5 py-4 transition-colors hover:bg-[var(--color-muted)]/40 focus-visible:bg-[var(--color-muted)]/40 lg:grid-cols-[88px_1.3fr_1fr_0.8fr_0.7fr_auto] lg:items-center lg:gap-4">
                <span className="font-[family-name:var(--font-heading)] text-2xl tabular-nums">{booking.start_time.slice(0, 5)}</span>
                <span><span className="block text-sm font-medium">{customer?.full_name ?? "—"}</span><span className="mt-0.5 block text-[11px] text-[var(--color-muted-foreground)]">{customer?.phone ?? "—"}</span></span>
                <span className="text-xs text-[var(--color-muted-foreground)]">{packageName(booking)}</span>
                <span className="flex items-center gap-1 text-xs capitalize text-[var(--color-muted-foreground)]"><MapPin className="h-3 w-3" aria-hidden="true" />{booking.location_type || "—"}</span>
                <span className="text-sm tabular-nums lg:text-right">{formatCurrency(Number(booking.total) || 0)}</span>
                <StatusMark status={booking.status as BookingStatus} />
                <span className="flex gap-3 text-[10px] text-[var(--color-muted-foreground)] lg:hidden"><span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" aria-hidden="true" />{booking.event_date}</span><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" aria-hidden="true" />{booking.start_time.slice(0, 5)}</span><span className="flex items-center gap-1"><CreditCard className="h-3 w-3" aria-hidden="true" />{formatCurrency(Number(booking.total) || 0)}</span></span>
              </Link>
            );
          })}
        </div>
      )}
    </RuledFrame>
  );
}
