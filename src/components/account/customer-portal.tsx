"use client";

import Link from "next/link";
import { CalendarDays, Clock3, MapPin, CreditCard } from "lucide-react";

import { BookingHistory } from "@/components/account/booking-history";
import { BookingStatusRealtime } from "@/components/account/booking-status-realtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(
    new Date(`1970-01-01T${value.slice(0, 5)}:00`),
  );
}

function bookingName(booking: Booking) {
  return (booking.packages as { name?: string } | undefined)?.name ?? "Custom booking";
}

export function CustomerPortal({
  email,
  upcomingBooking,
  history,
}: {
  email: string;
  upcomingBooking: Booking | null;
  history: Booking[];
}) {
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">Account</p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl sm:text-5xl">My account</h1>
          <p className="mt-3 break-words text-sm text-[var(--color-muted-foreground)]">{email}</p>
          <form action="/auth/signout" method="POST" className="mt-5">
            <Button variant="outline" size="sm">Sign out</Button>
          </form>
        </div>

        <div className="lg:col-span-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">Upcoming appointment</p>
          {upcomingBooking ? (
            <Card className="mt-3 overflow-hidden">
              <CardHeader className="border-b border-[var(--color-border)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-2xl">{bookingName(upcomingBooking)}</h2>
                    <p className="mt-1 font-mono text-[10px] text-[var(--color-muted-foreground)]">{upcomingBooking.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <BookingStatusRealtime bookingId={upcomingBooking.id} initialStatus={upcomingBooking.status as BookingStatus}>
                    {(status) => <span className="text-xs font-medium">{status.replaceAll("_", " ")}</span>}
                  </BookingStatusRealtime>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="grid gap-4 text-sm sm:grid-cols-3">
                  <div className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" /><span>{formatDate(upcomingBooking.event_date)}</span></div>
                  <div className="flex items-start gap-2"><Clock3 className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" /><span>{formatTime(upcomingBooking.start_time)}</span></div>
                  <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" /><span className="capitalize">{upcomingBooking.location_type || "—"}</span></div>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 text-sm">
                  <span className="flex items-center gap-2 text-[var(--color-muted-foreground)]"><CreditCard className="h-4 w-4" aria-hidden="true" /> Total</span>
                  <span className="font-medium tabular-nums">{formatCurrency(Number(upcomingBooking.total) || 0)}</span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-4">
                  <BookingStatusRealtime bookingId={upcomingBooking.id} initialStatus={upcomingBooking.status as BookingStatus} showTrack>
                    {() => null}
                  </BookingStatusRealtime>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/book/confirmation/${upcomingBooking.id}`}>Open booking details</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-3 border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-8">
              <p className="text-sm text-[var(--color-muted-foreground)]">You don&apos;t have an upcoming appointment.</p>
              <Button variant="accent" size="sm" asChild className="mt-4"><Link href="/book">Book an appointment</Link></Button>
            </div>
          )}
        </div>
      </div>

      <section className="mt-12" aria-labelledby="booking-history-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">Your records</p>
            <h2 id="booking-history-heading" className="mt-1 font-[family-name:var(--font-heading)] text-3xl">Booking history</h2>
          </div>
          {!upcomingBooking && history.length > 0 && <Button variant="link" asChild><Link href="/book">Book an appointment</Link></Button>}
        </div>
        <div className="mt-4">
          {history.length === 0 && !upcomingBooking ? (
            <div className="border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-10 text-center">
              <p className="text-sm text-[var(--color-muted-foreground)]">You don&apos;t have any bookings yet.</p>
              <Button variant="accent" size="sm" asChild className="mt-4"><Link href="/book">Book your first appointment</Link></Button>
            </div>
          ) : (
            <BookingHistory bookings={history} upcomingId={upcomingBooking?.id} />
          )}
        </div>
      </section>
    </>
  );
}
