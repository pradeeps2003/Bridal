import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/booking/payment-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blockDate, unblockDate } from "@/app/admin/actions";
import { getCalendarBookings } from "@/lib/data/bookings";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types";
import { ChevronLeft, ChevronRight, Lock, Trash2 } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

async function getBlockedDates() {
  const supabase = await createClient();
  const { data } = await supabase.from("blocked_dates").select("*").order("blocked_date");
  return data ?? [];
}

export default async function AdminCalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const month = params.month ?? new Date().toISOString().slice(0, 7);

  const [bookings, blockedDates] = await Promise.all([
    getCalendarBookings(month),
    getBlockedDates(),
  ]);

  const prevMonth = new Date(`${month}-01`);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const nextMonth = new Date(`${month}-01`);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const bookingsByDate = bookings.reduce<Record<string, typeof bookings>>((acc, b) => {
    (acc[b.event_date] ??= []).push(b);
    return acc;
  }, {});

  const daysInMonth = new Date(
    new Date(`${month}-01`).getFullYear(),
    new Date(`${month}-01`).getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfWeek = new Date(`${month}-01`).getDay();
  const displayMonth = new Date(`${month}-01`);
  const monthName = displayMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <AdminShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">Calendar</h1>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Manage your bookings and block unavailable dates
          </p>
        </div>

        {/* Block Date Card */}
        <Card className="border-[var(--color-border)]">
          <CardHeader>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">Block a Date</h2>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              Prevent bookings on specific dates (holidays, personal time, etc.)
            </p>
          </CardHeader>
          <CardContent>
            <form action={blockDate} className="grid gap-4 sm:grid-cols-3 sm:items-end">
              <div>
                <Label htmlFor="blocked_date" className="text-sm font-medium">Select Date</Label>
                <Input
                  id="blocked_date"
                  name="blocked_date"
                  type="date"
                  required
                  className="mt-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <Label htmlFor="reason" className="text-sm font-medium">Reason (Optional)</Label>
                <Input
                  id="reason"
                  name="reason"
                  placeholder="e.g., Holiday, Personal"
                  className="mt-2 rounded-lg text-sm"
                />
              </div>
              <Button type="submit" variant="accent" className="rounded-lg h-10">
                <Lock className="h-4 w-4 mr-2" />
                Block Date
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Blocked Dates List */}
        {blockedDates.length > 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">Blocked Dates</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {blockedDates.map((d) => (
                <div
                  key={d.blocked_date}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-red-900">{d.blocked_date}</p>
                    {(d.reason as string) && (
                      <p className="text-xs text-red-700">{d.reason as string}</p>
                    )}
                  </div>
                  <form action={unblockDate.bind(null, d.blocked_date as string)}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">{monthName}</h2>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""} this month
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-lg"
              >
                <Link href={`/admin/calendar?month=${prevMonth.toISOString().slice(0, 7)}`}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-lg"
              >
                <Link href={`/admin/calendar?month=${nextMonth.toISOString().slice(0, 7)}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-[var(--color-muted-foreground)] py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Empty cells for days before month starts */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-lg bg-[var(--color-muted)]/20" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = String(i + 1).padStart(2, "0");
                const date = `${month}-${day}`;
                const dayBookings = bookingsByDate[date] ?? [];
                const isBlocked = blockedDates.some((d) => d.blocked_date === date);
                const isToday = date === new Date().toISOString().slice(0, 10);

                // Determine booking status colors
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case "CONFIRMED":
                      return "bg-green-100 text-green-700 border-green-200";
                    case "PENDING":
                    case "HELD":
                      return "bg-yellow-100 text-yellow-700 border-yellow-200";
                    case "CANCELLED":
                      return "bg-red-100 text-red-700 border-red-200";
                    case "COMPLETED":
                      return "bg-blue-100 text-blue-700 border-blue-200";
                    default:
                      return "bg-gray-100 text-gray-700 border-gray-200";
                  }
                };

                const hasBookings = dayBookings.length > 0;

                return (
                  <div
                    key={date}
                    className={`aspect-square rounded-lg border-2 p-2 flex flex-col transition-colors ${
                      isBlocked
                        ? "border-red-300 bg-red-50"
                        : isToday
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                          : "border-[var(--color-border)] bg-[var(--color-card)]"
                    }`}
                  >
                    <p className={`text-xs font-bold ${isBlocked ? "text-red-600" : "text-[var(--color-foreground)]"}`}>
                      {i + 1}
                    </p>
                    {isBlocked && <p className="text-[10px] text-red-600">Blocked</p>}
                    {hasBookings && (
                      <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                        {dayBookings.slice(0, 2).map((b) => {
                          const customer = b.customers as { full_name: string } | undefined;
                          const bookingStatusColor = getStatusColor(b.status);
                          return (
                            <Link
                              key={b.id}
                              href={`/admin/bookings/${b.id}`}
                              className={`block rounded px-1 py-0.5 text-[9px] font-medium hover:opacity-80 truncate ${bookingStatusColor}`}
                              title={`${b.start_time.slice(0, 5)} - ${customer?.full_name} (${b.status})`}
                            >
                              {b.start_time.slice(0, 5)}
                            </Link>
                          );
                        })}
                        {dayBookings.length > 2 && (
                          <p className="text-[9px] text-[var(--color-muted-foreground)]">
                            +{dayBookings.length - 2} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-2">
            <div className="h-3 w-3 rounded border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/5" />
            <div className="text-xs">
              <p className="font-medium">Today</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2">
            <div className="h-3 w-3 rounded border-2 border-green-200 bg-green-100" />
            <div className="text-xs">
              <p className="font-medium text-green-700">Confirmed</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-2">
            <div className="h-3 w-3 rounded border-2 border-yellow-200 bg-yellow-100" />
            <div className="text-xs">
              <p className="font-medium text-yellow-700">Pending</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2">
            <div className="h-3 w-3 rounded border-2 border-red-200 bg-red-100" />
            <div className="text-xs">
              <p className="font-medium text-red-700">Cancelled</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2">
            <div className="h-3 w-3 rounded border-2 border-blue-200 bg-blue-100" />
            <div className="text-xs">
              <p className="font-medium text-blue-700">Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-2">
            <div className="h-3 w-3 rounded border-2 border-red-300 bg-red-50" />
            <div className="text-xs">
              <p className="font-medium text-red-700">Blocked</p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
