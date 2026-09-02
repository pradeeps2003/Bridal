import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/booking/payment-button";
import { Badge } from "@/components/ui/badge";
import { getBookings } from "@/lib/data/bookings";
import { formatCurrency } from "@/lib/utils";
import type { BookingStatus } from "@/types";

export default async function AdminBookingsPage() {
  const bookings = await getBookings({ limit: 100 });

  return (
    <AdminShell>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl">Bookings</h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
              Review and manage customer booking requests.
            </p>
          </div>
          <Link href="/admin/calendar" className="text-sm sm:text-base text-[var(--color-accent)] self-start sm:self-auto">
            View Calendar →
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] text-center py-12">No bookings yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => {
              const customer = booking.customers as { full_name: string; phone: string } | undefined;
              const pkg = booking.packages as { name: string } | undefined;
              return (
                <div key={booking.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 flex flex-col hover:border-[var(--color-accent)]/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-[var(--color-foreground)]">{customer?.full_name ?? "—"}</p>
                      <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-1">{customer?.phone}</p>
                    </div>
                    <StatusBadge status={booking.status as BookingStatus} />
                  </div>
                  
                  <div className="space-y-2 flex-1 border-y border-[var(--color-border)] py-3 my-3">
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-[var(--color-muted-foreground)]">Package</span>
                      <span className="font-medium text-right max-w-[60%] truncate">{pkg?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-[var(--color-muted-foreground)]">Date & Time</span>
                      <span className="font-medium">
                        {new Date(booking.event_date).toLocaleDateString()} at {booking.start_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-[var(--color-muted-foreground)]">Total</span>
                      <span className="font-medium text-[var(--color-accent)]">{formatCurrency(Number(booking.total))}</span>
                    </div>
                  </div>

                  <Link 
                    href={`/admin/bookings/${booking.id}`} 
                    className="w-full flex items-center justify-center h-11 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium text-sm sm:text-base hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                  >
                    Manage Booking
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
