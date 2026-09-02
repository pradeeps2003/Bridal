import { BookingLedger } from "@/components/admin/booking-ledger";
import type { Booking } from "@/types";
import { Users, CheckCircle2, Clock, XCircle, UserCheck, TrendingUp, Calendar, DollarSign, AlertCircle } from "lucide-react";

export function AdminDashboard({
  date,
  todayBookings,
  stats,
}: {
  date: string;
  todayBookings: Booking[];
  stats: { todayBookings: number; pendingRequests: number; confirmedBookings: number; upcomingBookings: number; revenueCaptured: number };
}) {
  const pending = todayBookings.filter((booking) => ["REQUESTED", "HELD", "ADMIN_APPROVED", "PAYMENT_PENDING"].includes(booking.status));
  const confirmed = todayBookings.filter((booking) => ["CONFIRMED"].includes(booking.status));
  const completed = todayBookings.filter((booking) => ["COMPLETED"].includes(booking.status));
  const cancelled = todayBookings.filter((booking) => ["CANCELLED", "REJECTED", "EXPIRED"].includes(booking.status));
  const totalBookings = todayBookings.length;
  const validBookings = todayBookings.filter((booking) => !["CANCELLED", "REJECTED", "EXPIRED"].includes(booking.status));
  const todayRevenue = validBookings.reduce((sum, booking) => sum + (Number(booking.total) || 0), 0);
  const averageBookingValue = validBookings.length > 0 ? todayRevenue / validBookings.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">Today</p>
          <h1 className="mt-1 font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl">Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00`))}</p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-[var(--color-muted-foreground)]">
          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-muted)]/30 px-3 py-2">
            <Calendar className="h-4 w-4 text-[var(--color-accent)]" />
            <span className="font-medium">{stats.todayBookings} booking{stats.todayBookings === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-muted)]/30 px-3 py-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="font-medium">₹{todayRevenue.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-muted)]/30 px-3 py-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{stats.upcomingBookings} upcoming</span>
          </div>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {/* Total Bookings */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">Total</p>
              <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl tabular-nums text-[var(--color-foreground)]">{totalBookings}</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">All bookings</p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-2">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">Pending</p>
              <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl tabular-nums text-[var(--color-foreground)]">{pending.length}</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Awaiting action</p>
            </div>
            <div className="rounded-full bg-yellow-500/10 p-2">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Confirmed/Active */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">Active</p>
              <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl tabular-nums text-[var(--color-foreground)]">{confirmed.length}</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Confirmed bookings</p>
            </div>
            <div className="rounded-full bg-green-500/10 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">Completed</p>
              <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl tabular-nums text-[var(--color-foreground)]">{completed.length}</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Finished today</p>
            </div>
            <div className="rounded-full bg-purple-500/10 p-2">
              <UserCheck className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Cancelled/Failed */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">Cancelled</p>
              <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl tabular-nums text-[var(--color-foreground)]">{cancelled.length}</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Failed bookings</p>
            </div>
            <div className="rounded-full bg-red-500/10 p-2">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">Revenue</p>
              <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl tabular-nums text-[var(--color-foreground)]">₹{todayRevenue.toLocaleString("en-IN")}</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Today&apos;s earnings</p>
            </div>
            <div className="rounded-full bg-emerald-500/10 p-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold">Conversion Rate</h3>
          </div>
          <p className="text-2xl font-[family-name:var(--font-heading)] tabular-nums">
            {totalBookings > 0 ? Math.round((confirmed.length / totalBookings) * 100) : 0}%
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Confirmed vs total bookings</p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
            </div>
            <h3 className="text-sm font-semibold">Average Booking</h3>
          </div>
          <p className="text-2xl font-[family-name:var(--font-heading)] tabular-nums">
            ₹{averageBookingValue.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Average value per booking</p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-orange-500/10 p-2">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <h3 className="text-sm font-semibold">Pending Requests</h3>
          </div>
          <p className="text-2xl font-[family-name:var(--font-heading)] tabular-nums">
            {stats.pendingRequests}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Awaiting your action</p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-red-500/10 p-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold">Cancellation Rate</h3>
          </div>
          <p className="text-2xl font-[family-name:var(--font-heading)] tabular-nums">
            {totalBookings > 0 ? Math.round((cancelled.length / totalBookings) * 100) : 0}%
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Cancelled vs total bookings</p>
        </div>
      </div>

      {/* Urgent Actions */}
      {pending.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Urgent: {pending.length} booking{pending.length === 1 ? "" : "s"} pending approval</h3>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Review and respond to pending booking requests to secure your schedule.
          </p>
        </div>
      )}

      <BookingLedger bookings={todayBookings} date={date} />
    </div>
  );
}
