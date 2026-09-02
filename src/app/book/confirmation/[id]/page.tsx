import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PayNowButton, StatusBadge } from "@/components/booking/payment-button";
import { UpiPayment } from "@/components/booking/upi-payment";
import { Button } from "@/components/ui/button";
import { getPublicBooking } from "@/lib/data/bookings";
import { formatCurrency } from "@/lib/utils";
import { getPaymentSettings, getSiteSettings } from "@/lib/data/settings";
import { getClientEnv } from "@/lib/env";
import { getBookingPayments } from "@/lib/payments/confirm";
import { isRazorpayConfigured } from "@/lib/payments/razorpay";
import type { BookingStatus } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const { id } = await params;
  const [booking, siteSettings, paymentSettings, payments] = await Promise.all([
    getPublicBooking(id),
    getSiteSettings(),
    getPaymentSettings(),
    getBookingPayments(id).catch(() => []),
  ]);

  if (!booking) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen pt-24 section-padding text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl">Booking not found</h1>
          <Button variant="accent" className="mt-6" asChild>
            <Link href="/book">Start a new booking</Link>
          </Button>
        </main>
        <SiteFooter />
      </>
    );
  }

  const status = booking.status as BookingStatus;
  const upiId = (paymentSettings as { upi_id?: string }).upi_id ?? "";
  const upiName = siteSettings.business_name ?? "Glow with Rubi";
  const canPay =
    ["ADMIN_APPROVED", "PAYMENT_PENDING"].includes(status) && Number(booking.advance) > 0;
  const canPayUpi = canPay && Boolean(upiId);
  const razorpayKey = getClientEnv().NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const canPayRazorpay = canPay && isRazorpayConfigured() && Boolean(razorpayKey);
  const pendingUpi = payments.find(
    (payment) => payment.gateway === "upi" && payment.status === "PENDING",
  );

  const pkg = booking.packages as { name: string; pricing_type?: string } | undefined;
  const svc = booking.services as { name: string } | undefined;
  const customer = booking.customers as { full_name: string; phone: string; whatsapp?: string } | undefined;

  const whatsappNumRaw = siteSettings.whatsapp || siteSettings.phone || "918526475322";
  const cleanNum = whatsappNumRaw.replace(/\D/g, "");
  const formattedWa = cleanNum.length === 10 ? `91${cleanNum}` : cleanNum;

  const waText = encodeURIComponent(
    `Hi Glow with Rubi! I submitted a booking request.\n\n*Booking Ref:* #${id.slice(0, 8).toUpperCase()}\n*Name:* ${customer?.full_name || "Customer"}\n*Package:* ${pkg?.name || "Makeup Package"}\n*Date:* ${booking.event_date} at ${booking.start_time.slice(0, 5)}\n\nPlease review and confirm availability!`
  );
  const waUrl = `https://wa.me/${formattedWa}?text=${waText}`;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-20 sm:pt-24 section-padding w-full">
        <div className="mx-auto max-w-xl px-4 sm:px-6 w-full">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
              Booking Confirmation
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl">
              {status === "CONFIRMED" ? "You're confirmed!" : "Request received"}
            </h1>
            <div className="mt-4 flex justify-center">
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="mt-10 space-y-4 rounded-sm border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted-foreground)]">Reference</span>
              <span className="font-mono text-xs">{id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted-foreground)]">Customer</span>
              <span>{customer?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted-foreground)]">Service</span>
              <span>{pkg?.name ?? svc?.name ?? "Makeup Service"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted-foreground)]">Date &amp; Time</span>
              <span>
                {booking.event_date} at {booking.start_time.slice(0, 5)}
              </span>
            </div>
            {Number(booking.total) > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-foreground)]">Total</span>
                  <span>{formatCurrency(Number(booking.total))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-foreground)]">Advance due</span>
                  <span className="text-[var(--color-accent)]">
                    {formatCurrency(Number(booking.advance))}
                  </span>
                </div>
              </>
            )}
          </div>

          {status === "HELD" && (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 p-4 text-center text-sm text-[var(--color-accent)]">
                <p className="font-semibold">Request Saved & Slot Temporarily Held</p>
                <p className="mt-1 text-xs leading-relaxed">
                  We&apos;ve received your request! You can tap below to send the details directly to Rubi on WhatsApp, or wait for admin approval.
                </p>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-emerald-700 min-h-[48px]"
              >
                <MessageCircle className="h-5 w-5" />
                Send Request Details via WhatsApp
              </a>
            </div>
          )}

          {status === "REQUESTED" && (
            <div className="mt-6 space-y-4">
              <p className="text-center text-sm text-[var(--color-muted-foreground)]">
                Custom quote request received. We&apos;ll contact you with pricing details.
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-emerald-700 min-h-[48px]"
              >
                <MessageCircle className="h-5 w-5" />
                Send Quote Request via WhatsApp
              </a>
            </div>
          )}

          {status === "CONFIRMED" && (
            <div className="mt-6 rounded-sm bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 p-4 text-center text-sm text-[var(--color-accent)]">
              <p className="font-semibold">Booking Confirmed</p>
              <p className="mt-1 text-xs">See you on {booking.event_date}!</p>
            </div>
          )}

          {canPayRazorpay && customer && (
            <div className="mt-8 space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Pay online
              </p>
              <PayNowButton
                bookingId={id}
                amount={Number(booking.advance)}
                customerName={customer.full_name}
                customerPhone={customer.phone}
                razorpayKeyId={razorpayKey}
              />
            </div>
          )}

          {canPayUpi && (
            <div className="mt-8">
              <UpiPayment
                upiId={upiId}
                upiName={upiName}
                amount={Number(booking.advance)}
                bookingRef={id.slice(0, 8).toUpperCase()}
                bookingId={id}
                alreadySubmitted={Boolean(pendingUpi)}
              />
            </div>
          )}

          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
