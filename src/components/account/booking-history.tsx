"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { BookingStatusRealtime } from "@/components/account/booking-status-realtime";
import { StatusTrack } from "@/components/account/status-track";
import { formatCurrency } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(
    new Date(`1970-01-01T${value.slice(0, 5)}:00`),
  );
}

function packageName(booking: Booking) {
  return (booking.packages as { name?: string } | undefined)?.name ?? "Custom booking";
}

function HistoryRow({ booking, openByDefault }: { booking: Booking; openByDefault: boolean }) {
  const [open, setOpen] = useState(openByDefault);
  const panelId = `booking-details-${booking.id}`;

  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="grid w-full grid-cols-[1fr_auto] gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--color-muted)]/40 focus-visible:bg-[var(--color-muted)]/40 sm:grid-cols-[1.1fr_1.6fr_1fr_auto_auto] sm:items-center sm:gap-4"
      >
        <span>
          <span className="block font-[family-name:var(--font-heading)] text-lg">{formatDate(booking.event_date)}</span>
          <span className="mt-0.5 block text-[11px] text-[var(--color-muted-foreground)] sm:hidden">{packageName(booking)}</span>
        </span>
        <span className="hidden text-sm sm:block">{packageName(booking)}</span>
        <span className="text-xs text-[var(--color-muted-foreground)] sm:text-sm">
          {booking.status.replaceAll("_", " ")}
        </span>
        <span className="text-right text-sm font-medium tabular-nums">{formatCurrency(Number(booking.total) || 0)}</span>
        <span className="col-start-2 row-start-1 flex justify-end text-[var(--color-muted-foreground)] sm:col-auto sm:row-auto">
          {open ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
        </span>
      </button>

      {open && (
        <div id={panelId} className="space-y-4 border-t border-[var(--color-border)] bg-[var(--color-muted)]/20 px-4 py-4">
          <div className="grid gap-3 text-xs sm:grid-cols-4">
            <div><p className="text-[var(--color-muted-foreground)]">Time</p><p className="mt-1">{formatTime(booking.start_time)}</p></div>
            <div><p className="text-[var(--color-muted-foreground)]">Location</p><p className="mt-1 capitalize">{booking.location_type || "—"}</p></div>
            <div><p className="text-[var(--color-muted-foreground)]">Booking ID</p><p className="mt-1 font-mono">{booking.id.slice(0, 8).toUpperCase()}</p></div>
            <div><p className="text-[var(--color-muted-foreground)]">Balance</p><p className="mt-1 tabular-nums">{formatCurrency(Number(booking.balance) || 0)}</p></div>
          </div>
          {booking.notes && <p className="border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted-foreground)]"><span className="font-medium text-[var(--color-foreground)]">Notes:</span> {booking.notes}</p>}
          <BookingStatusRealtime bookingId={booking.id} initialStatus={booking.status as BookingStatus}>
            {(status) => <StatusTrack status={status} />}
          </BookingStatusRealtime>
        </div>
      )}
    </div>
  );
}

export function BookingHistory({ bookings, upcomingId }: { bookings: Booking[]; upcomingId?: string }) {
  if (bookings.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-[var(--color-muted-foreground)]">No past bookings.</p>;
  }

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="hidden grid-cols-[1.1fr_1.6fr_1fr_auto_auto] gap-4 border-b border-[var(--color-border)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)] sm:grid">
        <span>Date</span><span>Booking</span><span>Status</span><span className="text-right">Total</span><span aria-hidden="true" />
      </div>
      {bookings.map((booking) => (
        <HistoryRow key={booking.id} booking={booking} openByDefault={booking.id === upcomingId} />
      ))}
    </div>
  );
}
