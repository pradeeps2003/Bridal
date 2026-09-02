"use client";

import { motion } from "framer-motion";

import { RuledFrame } from "@/components/admin/ruled-frame";
import { formatCurrency } from "@/lib/utils";
import type { AdminAnalytics, AnalyticsRange } from "@/types";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

const ranges: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

export function AnalyticsFrame({ analytics }: { analytics: AdminAnalytics }) {
  const maxRevenue = Math.max(...analytics.series.map((entry) => entry.revenue), 1);
  const maxBookings = Math.max(...analytics.series.map((entry) => entry.bookings + entry.cancelled), 1);
  const visibleSeries = analytics.series.length > 31
    ? analytics.series.filter((_, index) => index % Math.ceil(analytics.series.length / 30) === 0)
    : analytics.series;

  // Calculate percentages for pie chart
  const totalBookings = analytics.bookingCount + analytics.cancelledCount;
  const confirmedPercentage = totalBookings > 0 ? (analytics.bookingCount / totalBookings) * 100 : 0;
  const cancelledPercentage = totalBookings > 0 ? (analytics.cancelledCount / totalBookings) * 100 : 0;

  return (
    <RuledFrame>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--color-accent)]/10 p-2">
            <BarChart3 className="h-5 w-5 text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">Analytics</p>
            <h2 className="mt-1 font-[family-name:var(--font-heading)] text-2xl">Revenue & bookings</h2>
          </div>
        </div>
        <nav aria-label="Analytics range" className="flex gap-4">
          {ranges.map((range) => (
            <a
              key={range.value}
              href={`/admin?range=${range.value}`}
              aria-current={analytics.range === range.value ? "page" : undefined}
              className={`border-b pb-1 text-xs transition-colors ${analytics.range === range.value ? "border-[var(--color-accent)] text-[var(--color-foreground)]" : "border-transparent text-[var(--color-muted-foreground)] hover:border-[var(--color-border)]"}`}
            >
              {range.label}
            </a>
          ))}
        </nav>
      </div>
      
      <div className="grid gap-4 border-b border-[var(--color-border)] px-5 py-4 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-[var(--color-muted)]/30 p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <p className="text-[11px] text-[var(--color-muted-foreground)]">Revenue</p>
          </div>
          <p className="mt-1 font-[family-name:var(--font-heading)] text-xl tabular-nums">{formatCurrency(analytics.completedRevenue)}</p>
        </div>
        <div className="rounded-lg bg-[var(--color-muted)]/30 p-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <p className="text-[11px] text-[var(--color-muted-foreground)]">Bookings</p>
          </div>
          <p className="mt-1 font-[family-name:var(--font-heading)] text-xl tabular-nums">{analytics.bookingCount}</p>
        </div>
        <div className="rounded-lg bg-[var(--color-muted)]/30 p-3">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-red-500" />
            <p className="text-[11px] text-[var(--color-muted-foreground)]">Cancelled</p>
          </div>
          <p className="mt-1 font-[family-name:var(--font-heading)] text-xl tabular-nums">{analytics.cancelledCount}</p>
        </div>
      </div>

      <div className="px-5 py-5">
        {analytics.completedRevenue === 0 && analytics.bookingCount === 0 ? (
          <p className="border-b border-[var(--color-border)] pb-8 text-sm text-[var(--color-muted-foreground)]">No completed bookings in this range.</p>
        ) : (
          <div className="space-y-6" aria-label="Revenue and booking chart">
            {/* Revenue Bar Chart */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-[var(--color-foreground)]">Revenue Trend</p>
                <p className="text-[10px] text-[var(--color-muted-foreground)]">{analytics.fromDate} - {analytics.toDate}</p>
              </div>
              <div className="flex h-32 items-end gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/20 px-2 pb-0">
                {visibleSeries.map((entry) => (
                  <motion.div
                    key={entry.date}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((entry.revenue / maxRevenue) * 100, entry.revenue ? 3 : 0)}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="group relative min-w-1 flex-1 rounded-t bg-gradient-to-t from-[var(--color-accent)] to-[var(--color-accent)]/60 hover:from-[var(--color-accent)] hover:to-[var(--color-accent)]/80"
                    title={`${entry.date}: ${formatCurrency(entry.revenue)}`}
                  >
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-[10px] shadow-lg group-hover:block">
                      {entry.date} · {formatCurrency(entry.revenue)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bookings and Mini Pie Chart */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Bookings Bar Chart */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-[var(--color-foreground)]">Daily Bookings</p>
                  <p className="text-[10px] text-[var(--color-muted-foreground)]">Peak: {maxBookings}</p>
                </div>
                <div className="flex h-20 items-end gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/20 px-2 pb-0">
                  {visibleSeries.map((entry) => (
                    <div key={entry.date} className="relative flex h-full flex-1 items-end justify-center gap-px" title={`${entry.date}: ${entry.bookings} bookings, ${entry.cancelled} cancelled`}>
                      <span 
                        className="w-2 rounded-t bg-blue-500 transition-all hover:bg-blue-400" 
                        style={{ height: `${Math.max((entry.bookings / maxBookings) * 100, entry.bookings ? 8 : 0)}%` }} 
                      />
                      {entry.cancelled > 0 && (
                        <span 
                          className="absolute top-0 h-2 w-2 rounded-full border-2 border-red-500 bg-red-500/20" 
                          aria-label={`${entry.cancelled} cancelled`} 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie Chart for Booking Status */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-[var(--color-foreground)]">Booking Status</p>
                  <p className="text-[10px] text-[var(--color-muted-foreground)]">Total: {totalBookings}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="h-full w-full transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="var(--color-muted)"
                        strokeWidth="3"
                      />
                      {/* Confirmed bookings */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="3"
                        strokeDasharray={`${confirmedPercentage}, 100`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      {/* Cancelled bookings */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="var(--color-destructive)"
                        strokeWidth="3"
                        strokeDasharray={`${cancelledPercentage}, 100`}
                        strokeDashoffset={`-${confirmedPercentage}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold tabular-nums">{totalBookings}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                      <span className="text-xs text-[var(--color-foreground)]">Confirmed: {analytics.bookingCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[var(--color-destructive)]" />
                      <span className="text-xs text-[var(--color-foreground)]">Cancelled: {analytics.cancelledCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <table className="sr-only">
              <caption>Daily revenue and booking summary</caption>
              <thead><tr><th>Date</th><th>Revenue</th><th>Bookings</th><th>Cancelled</th></tr></thead>
              <tbody>{analytics.series.map((entry) => <tr key={entry.date}><td>{entry.date}</td><td>{entry.revenue}</td><td>{entry.bookings}</td><td>{entry.cancelled}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </RuledFrame>
  );
}
