import { RevenueChart } from "@/components/admin/revenue-chart";
import type { Booking } from "@/types";
import { CheckCircle2, Clock, CalendarDays, AlertCircle, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import Link from "next/link";

export function AdminDashboard({
  date,
  todayBookings,
  stats,
}: {
  date: string;
  todayBookings: Booking[];
  stats: { todayBookings: number; pendingRequests: number; confirmedBookings: number; upcomingBookings: number; revenueCaptured: number };
}) {
  const pending = todayBookings.filter((b) => ["REQUESTED", "HELD", "ADMIN_APPROVED", "PAYMENT_PENDING"].includes(b.status));
  const confirmed = todayBookings.filter((b) => b.status === "CONFIRMED");
  const validBookings = todayBookings.filter((b) => !["CANCELLED", "REJECTED", "EXPIRED"].includes(b.status));
  const todayRevenue = validBookings.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
  const averageBookingValue = validBookings.length > 0 ? todayRevenue / validBookings.length : 0;
  const totalBookings = todayBookings.length;

  const buckets = [
    {
      label: "All Bookings",
      value: totalBookings,
      sub: "today",
      icon: CalendarDays,
      color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      href: "/admin/bookings",
    },
    {
      label: "Confirmed",
      value: confirmed.length,
      sub: "confirmed today",
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      href: "/admin/bookings?status=CONFIRMED",
    },
    {
      label: "Upcoming",
      value: stats.upcomingBookings,
      sub: "scheduled ahead",
      icon: TrendingUp,
      color: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      href: "/admin/bookings",
    },
    {
      label: "Pending",
      value: pending.length,
      sub: "need your action",
      icon: Clock,
      color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      href: "/admin/bookings?status=HELD",
      urgent: pending.length > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">Today</p>
          <h1 className="mt-1 font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl">Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            {new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00`))}
          </p>
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
        </div>
      </div>

      {/* Revenue KPI + avg */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Today&apos;s Revenue</p>
              <p className="mt-2 font-numeric text-3xl text-[var(--color-foreground)]">
                <AnimatedNumber prefix="₹" value={todayRevenue} />
              </p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                avg ₹{Math.round(averageBookingValue).toLocaleString("en-IN")} per booking
              </p>
            </div>
            <div className="rounded-md bg-emerald-500/10 p-2.5 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Pending Approval</p>
              <p className="mt-2 font-numeric text-3xl text-[var(--color-foreground)]">
                <AnimatedNumber value={stats.pendingRequests} />
              </p>
              <p className={`mt-1 text-xs font-medium ${stats.pendingRequests > 0 ? "text-amber-600 dark:text-amber-400" : "text-[var(--color-muted-foreground)]"}`}>
                {stats.pendingRequests > 0 ? "⚠ Review required" : "All clear"}
              </p>
            </div>
            <div className={`rounded-md p-2.5 ${stats.pendingRequests > 0 ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"}`}>
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Bucket Cards — simple count buckets */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">Booking Buckets</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {buckets.map((bucket) => {
            const Icon = bucket.icon;
            return (
              <Link
                key={bucket.label}
                href={bucket.href}
                className={`group flex flex-col gap-3 rounded-xl border p-4 transition-all hover:shadow-md
                  ${bucket.urgent
                    ? "border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-900/20"
                    : "border-[var(--color-border)] bg-[var(--color-card)]"
                  }`}
              >
                <div className={`w-fit rounded-md p-2 ${bucket.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-numeric text-2xl font-bold text-[var(--color-foreground)]">
                    {bucket.value}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-[var(--color-muted-foreground)]">{bucket.label}</p>
                  <p className="text-[11px] text-[var(--color-muted-foreground)]/70">{bucket.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Revenue chart (click to expand) */}
      <RevenueChart />
    </div>
  );
}
