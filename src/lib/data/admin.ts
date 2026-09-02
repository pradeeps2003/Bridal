import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AdminAnalytics, AdminRole, AnalyticsRange, BookingStatus } from "@/types";
import type { TeamMember } from "@/lib/notifications/types";

export interface DashboardStats {
  todayBookings: number;
  pendingRequests: number;
  confirmedBookings: number;
  upcomingBookings: number;
  revenueCaptured: number;
}

const PENDING_STATUSES: BookingStatus[] = [
  "REQUESTED",
  "HELD",
  "ADMIN_APPROVED",
  "PAYMENT_PENDING",
];

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    todayBookings: 0,
    pendingRequests: 0,
    confirmedBookings: 0,
    upcomingBookings: 0,
    revenueCaptured: 0,
  };

  if (!isSupabaseConfigured()) return empty;

  try {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);

    const [todayRes, pendingRes, confirmedRes, upcomingRes, revenueRes] =
      await Promise.all([
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("event_date", today),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .in("status", PENDING_STATUSES),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "CONFIRMED"),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "CONFIRMED")
          .gte("event_date", today),
        supabase.from("payments").select("amount").eq("status", "CAPTURED"),
      ]);

    const revenueCaptured =
      revenueRes.data?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;

    return {
      todayBookings: todayRes.count ?? 0,
      pendingRequests: pendingRes.count ?? 0,
      confirmedBookings: confirmedRes.count ?? 0,
      upcomingBookings: upcomingRes.count ?? 0,
      revenueCaptured,
    };
  } catch (error) {
    console.warn("[dashboard] stats fetch failed:", error);
    return empty;
  }
}

function getRangeStart(range: AnalyticsRange) {
  const days = range === "7d" ? 6 : range === "90d" ? 89 : 29;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);
  return start;
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function getBookingAnalytics(
  range: AnalyticsRange = "30d",
): Promise<AdminAnalytics> {
  const from = getRangeStart(range);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const emptySeries: AdminAnalytics["series"] = [];
  for (const cursor = new Date(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
    emptySeries.push({ date: dateKey(cursor), revenue: 0, bookings: 0, cancelled: 0 });
  }

  const empty: AdminAnalytics = {
    range,
    fromDate: dateKey(from),
    toDate: dateKey(to),
    completedRevenue: 0,
    bookingCount: 0,
    averageBooking: 0,
    cancelledCount: 0,
    series: emptySeries,
  };
  if (!isSupabaseConfigured()) return empty;

  try {
    const supabase = await createClient();
    const [bookingsResult, paymentsResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("event_date, status, total")
        .gte("event_date", empty.fromDate)
        .lte("event_date", empty.toDate),
      supabase
        .from("payments")
        .select("amount, created_at")
        .eq("status", "CAPTURED")
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString()),
    ]);

    const seriesByDate = new Map(empty.series.map((entry) => [entry.date, entry]));
    let bookingCount = 0;
    let cancelledCount = 0;

    for (const booking of bookingsResult.data ?? []) {
      const date = seriesByDate.get(booking.event_date as string);
      if (!date) continue;
      if (booking.status === "CANCELLED") {
        date.cancelled += 1;
        cancelledCount += 1;
      } else {
        date.bookings += 1;
        bookingCount += 1;
      }
    }

    let completedRevenue = 0;
    for (const payment of paymentsResult.data ?? []) {
      const amount = Number(payment.amount) || 0;
      completedRevenue += amount;
      const date = seriesByDate.get((payment.created_at as string).slice(0, 10));
      if (date) date.revenue += amount;
    }

    return {
      ...empty,
      completedRevenue,
      bookingCount,
      averageBooking: bookingCount ? completedRevenue / bookingCount : 0,
      cancelledCount,
    };
  } catch (error) {
    console.warn("[dashboard] analytics fetch failed:", error);
    return empty;
  }
}

export async function getAdminTeam(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("admins")
      .select("id, email, full_name, role, is_active")
      .order("created_at", { ascending: true });
    return (data ?? []).map((member) => ({
      id: member.id as string,
      email: member.email as string,
      fullName: (member.full_name as string | null) ?? null,
      role: member.role as AdminRole,
      isActive: Boolean(member.is_active),
    }));
  } catch (error) {
    console.warn("[admin] team fetch failed:", error);
    return [];
  }
}

export async function getCurrentAdmin() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (!admin) return null;

  return { user, admin };
}
