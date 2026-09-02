import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminShell } from "@/components/admin/admin-shell";
import { getDashboardStats } from "@/lib/data/admin";
import { getBookings } from "@/lib/data/bookings";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminDashboardPage() {
  const date = new Date().toISOString().slice(0, 10);
  const [stats, todayBookings] = await Promise.all([
    getDashboardStats(),
    getBookings({ fromDate: date, toDate: date, limit: 100 }),
  ]);
  const connected = isSupabaseConfigured();

  return (
    <AdminShell>
      {!connected && <div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Supabase is not connected. Add the project keys to <code className="text-xs">.env.local</code> to enable live data and notifications.</div>}
      <AdminDashboard date={date} stats={stats} todayBookings={todayBookings} />
    </AdminShell>
  );
}
