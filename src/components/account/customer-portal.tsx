"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  CreditCard,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { BookingHistory } from "@/components/account/booking-history";
import { BookingStatusRealtime } from "@/components/account/booking-status-realtime";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS } from "@/lib/booking/state-machine";
import { formatCurrency } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
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

function firstName(name: string, email: string) {
  const fromName = name.trim().split(/\s+/)[0];
  if (fromName) return fromName;
  const local = email.split("@")[0] ?? "there";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function CustomerPortal({
  email,
  displayName,
  upcomingBooking,
  history,
}: {
  email: string;
  displayName: string;
  upcomingBooking: Booking | null;
  history: Booking[];
}) {
  const greeting = firstName(displayName, email);
  const historyCount = history.length + (upcomingBooking ? 1 : 0);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[hsl(345_40%_10%)] px-6 py-8 text-[hsl(30_25%_96%)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,hsl(40_65%_55%/0.22),transparent_50%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Client studio
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-4xl leading-tight sm:text-6xl">
              Welcome back, <span className="italic text-[var(--color-accent)]">{greeting}</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
              Dates, looks, and payments for Pollachi, Coimbatore, and Tamil Nadu — in one place.
            </p>
            <p className="mt-2 text-xs text-white/45">{email}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button variant="modern" asChild className="h-11 rounded-full px-6">
              <Link href="/book">Book a date</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-11 rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10"
            >
              <Link href="/packages">Browse looks</Link>
            </Button>
            <form action="/auth/signout" method="POST">
              <Button
                variant="ghost"
                type="submit"
                className="h-11 rounded-full px-5 text-white/80 hover:bg-white/10 hover:text-white"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">Next date</p>
          <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl">
            {upcomingBooking ? formatDate(upcomingBooking.event_date).split(",")[0] : "Open"}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            {upcomingBooking ? bookingName(upcomingBooking) : "No appointment locked yet"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">Records</p>
          <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl">{historyCount}</p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            {historyCount === 1 ? "booking on file" : "bookings on file"}
          </p>
        </div>
        <Link
          href="/contact"
          className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 transition hover:border-[var(--color-accent)]/40"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">Studio help</p>
          <p className="mt-2 flex items-center gap-2 font-[family-name:var(--font-heading)] text-3xl">
            Ask Rubi
            <ArrowUpRight className="h-5 w-5 text-[var(--color-accent)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Questions, extras, travel across Tamil Nadu</p>
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              Upcoming
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-heading)] text-3xl">Your next look</h2>
          </div>
        </div>

        {upcomingBooking ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_24px_60px_hsl(345_40%_12%/0.06)]">
            <div className="grid lg:grid-cols-[0.9fr_1.2fr]">
              <div className="relative min-h-[12rem] bg-[hsl(345_40%_12%)] p-6 text-white lg:min-h-full">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  {upcomingBooking.location_type === "home" ? "Home / venue" : "Studio"}
                </p>
                <p className="mt-4 font-[family-name:var(--font-heading)] text-4xl leading-tight">
                  {bookingName(upcomingBooking)}
                </p>
                <p className="mt-3 text-sm text-white/70">{formatDate(upcomingBooking.event_date)}</p>
                <p className="mt-1 text-sm text-white/70">{formatTime(upcomingBooking.start_time)}</p>
              </div>
              <div className="space-y-5 p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[10px] tracking-wider text-[var(--color-muted-foreground)]">
                    ID {upcomingBooking.id.slice(0, 8).toUpperCase()}
                  </p>
                  <BookingStatusRealtime
                    bookingId={upcomingBooking.id}
                    initialStatus={upcomingBooking.status as BookingStatus}
                  >
                    {(status) => (
                      <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-foreground)]">
                        {STATUS_LABELS[status]}
                      </span>
                    )}
                  </BookingStatusRealtime>
                </div>
                <div className="grid gap-4 text-sm sm:grid-cols-3">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
                    <span>{formatDate(upcomingBooking.event_date)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock3 className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
                    <span>{formatTime(upcomingBooking.start_time)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
                    <span className="capitalize">{upcomingBooking.location_type || "—"}</span>
                  </div>
                </div>
                <div className="grid gap-3 border-t border-[var(--color-border)] pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">Total</p>
                    <p className="mt-1 font-numeric text-lg font-medium">
                      {formatCurrency(Number(upcomingBooking.total) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">Advance</p>
                    <p className="mt-1 font-numeric text-lg font-medium">
                      {formatCurrency(Number(upcomingBooking.advance) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                      Event-day balance
                    </p>
                    <p className="mt-1 font-numeric text-lg font-medium">
                      {formatCurrency(Number(upcomingBooking.balance) || 0)}
                    </p>
                  </div>
                </div>
                <BookingStatusRealtime
                  bookingId={upcomingBooking.id}
                  initialStatus={upcomingBooking.status as BookingStatus}
                  showTrack
                >
                  {() => null}
                </BookingStatusRealtime>
                <div className="flex flex-wrap gap-3">
                  <Button variant="accent" asChild className="h-11 rounded-full">
                    <Link href={`/book/confirmation/${upcomingBooking.id}`}>Open booking</Link>
                  </Button>
                  <Button variant="outline" asChild className="h-11 rounded-full">
                    <Link href="/contact">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Message studio
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-dashed border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="grid lg:grid-cols-2">
              <div className="flex flex-col justify-center p-8 sm:p-10">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  No date on the calendar yet. Reserve a look for Pollachi, Coimbatore, or anywhere we travel in Tamil
                  Nadu.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="accent" asChild className="h-11 rounded-full px-6">
                    <Link href="/book">Book an appointment</Link>
                  </Button>
                  <Button variant="outline" asChild className="h-11 rounded-full px-6">
                    <Link href="/packages">See packages</Link>
                  </Button>
                </div>
              </div>
              <div className="relative min-h-[14rem] bg-[hsl(345_40%_10%)] p-8 text-white">
                <CreditCard className="h-8 w-8 text-[var(--color-accent)]" aria-hidden="true" />
                <p className="mt-6 font-[family-name:var(--font-heading)] text-3xl italic leading-snug">
                  HD bridal, composed for a long wedding day.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="booking-history-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              Your records
            </p>
            <h2 id="booking-history-heading" className="mt-1 font-[family-name:var(--font-heading)] text-3xl">
              Booking history
            </h2>
          </div>
        </div>
        {history.length === 0 && !upcomingBooking ? (
          <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-8 text-sm text-[var(--color-muted-foreground)]">
            After you book, every look will live here — status, payments, and cancel options included.
          </p>
        ) : history.length === 0 ? (
          <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-8 text-sm text-[var(--color-muted-foreground)]">
            Your first booking is listed above. Past dates will appear here.
          </p>
        ) : (
          <BookingHistory bookings={history} upcomingId={upcomingBooking?.id} />
        )}
      </section>
    </div>
  );
}
