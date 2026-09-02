import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CustomerPortal } from "@/components/account/customer-portal";
import { getCustomerBookings } from "@/lib/data/bookings";
import { tryCreateClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | Glow with Rubi",
  description: "View your booking history and manage your appointments.",
};

const TERMINAL_STATUSES = new Set(["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"]);

export default async function AccountPage() {
  const supabase = await tryCreateClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bookings = await getCustomerBookings(user.id);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings
    .filter((booking) => !TERMINAL_STATUSES.has(booking.status) && booking.event_date >= today)
    .sort((a, b) => `${a.event_date}${a.start_time}`.localeCompare(`${b.event_date}${b.start_time}`))[0] ?? null;
  const history = bookings.filter((booking) => booking.id !== upcoming?.id);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-background)] pt-24 pb-16 lg:pt-32">
        <div className="container-narrow px-6">
          <CustomerPortal email={user.email ?? ""} upcomingBooking={upcoming} history={history} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
