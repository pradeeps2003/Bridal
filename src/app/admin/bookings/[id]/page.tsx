import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/booking/payment-button";
import { BookingStatusActions } from "@/components/admin/booking-status-actions";
import { Card, CardContent } from "@/components/ui/card";
import { getBookingById } from "@/lib/data/bookings";
import { getBookingPayments } from "@/lib/payments/confirm";
import { formatCurrency } from "@/lib/utils";
import type { BookingStatus } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [booking, payments] = await Promise.all([getBookingById(id), getBookingPayments(id).catch(() => [])]);

  if (!booking) {
    return (
      <AdminShell>
        <p>Booking not found.</p>
        <Link href="/admin/bookings">← Back</Link>
      </AdminShell>
    );
  }

  const customer = booking.customers as { full_name: string; phone: string; email?: string } | undefined;
  const pkg = booking.packages as { name: string; pricing_type: string } | undefined;
  const status = booking.status as BookingStatus;
  const pendingUpi = payments.find((payment) => payment.gateway === "upi" && payment.status === "PENDING");

  const actions: { label: string; status: BookingStatus; variant?: "accent" | "outline" }[] = [];

  if (["REQUESTED", "HELD"].includes(status)) {
    actions.push({ label: "Approve", status: "ADMIN_APPROVED", variant: "accent" });
    actions.push({ label: "Reject", status: "REJECTED", variant: "outline" });
  }
  if (["ADMIN_APPROVED", "PAYMENT_PENDING"].includes(status)) {
    actions.push({
      label: pendingUpi ? "Approve payment" : "Mark Confirmed (manual)",
      status: "CONFIRMED",
      variant: "accent",
    });
  }
  if (["CONFIRMED", "PAYMENT_PENDING", "ADMIN_APPROVED"].includes(status)) {
    actions.push({ label: "Cancel", status: "CANCELLED", variant: "outline" });
  }
  if (status === "CONFIRMED") {
    actions.push({ label: "Mark Completed", status: "COMPLETED", variant: "accent" });
  }

  return (
    <AdminShell>
      <div className="space-y-6 sm:space-y-8">
        <div className="px-4 sm:px-0">
          <Link href="/admin/bookings" className="text-sm sm:text-base text-[var(--color-accent)]">← All bookings</Link>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl">
            {customer?.full_name ?? "Booking"}
          </h1>
          <div className="mt-2">
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 px-4 sm:px-0">
          <Card>
            <CardContent className="space-y-3 pt-6 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Package</span>
                <span className="font-medium">{pkg?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Date & Time</span>
                <span className="font-medium">{booking.event_date} {booking.start_time.slice(0, 5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Phone</span>
                <span className="font-medium">{customer?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Location</span>
                <span className="font-medium capitalize">{booking.location_type}</span>
              </div>
              {booking.address && (
                <div>
                  <span className="text-[var(--color-muted-foreground)]">Address</span>
                  <p className="mt-1 font-medium">{booking.address}</p>
                </div>
              )}
              <div className="border-t border-[var(--color-border)] pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span className="text-[var(--color-accent)]">{formatCurrency(Number(booking.total))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Advance</span>
                <span className="font-medium">{formatCurrency(Number(booking.advance))}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl">Actions</h2>
              {pendingUpi ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
                  <p className="font-semibold">UPI receipt waiting for approval</p>
                  <p className="mt-1">UTR: {(pendingUpi.metadata as { utr?: string } | null)?.utr ?? pendingUpi.payment_id}</p>
                  {(pendingUpi.metadata as { proof_url?: string } | null)?.proof_url ? (
                    <a
                      className="mt-2 inline-block underline"
                      href={(pendingUpi.metadata as { proof_url?: string }).proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View screenshot
                    </a>
                  ) : null}
                </div>
              ) : null}
              <BookingStatusActions
                bookingId={id}
                actions={actions}
                customerPhone={customer?.phone}
                customerName={customer?.full_name}
              />
              {payments.length > 0 && (
                <div className="space-y-2 text-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">Payments</p>
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between gap-2">
                      <span className="capitalize">{payment.gateway} · {payment.status.toLowerCase()}</span>
                      <span>{formatCurrency(Number(payment.amount))}</span>
                    </div>
                  ))}
                </div>
              )}
              {booking.notes && (
                <div>
                  <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">Customer notes</p>
                  <p className="mt-1 text-sm sm:text-base">{booking.notes}</p>
                </div>
              )}
              <Link
                href={`/book/confirmation/${id}`}
                className="inline-block text-sm sm:text-base text-[var(--color-accent)] underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View customer confirmation page →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
