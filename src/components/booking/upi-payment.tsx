"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Smartphone, QrCode, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface UpiPaymentProps {
  upiId: string;
  upiName: string;
  amount: number;
  bookingRef: string;
  bookingId: string;
  alreadySubmitted?: boolean;
}

export function UpiPayment({
  upiId,
  upiName,
  amount,
  bookingRef,
  bookingId,
  alreadySubmitted = false,
}: UpiPaymentProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(true);
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const note = `GlowRubi-${bookingRef}`;
  const amountPaise = amount; // amount in rupees

  // UPI deep links for major apps
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amountPaise}&tn=${encodeURIComponent(note)}&cu=INR`;
  const phonepeLink = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amountPaise}&tn=${encodeURIComponent(note)}&cu=INR`;
  const gpayLink = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amountPaise}&tn=${encodeURIComponent(note)}&cu=INR`;

  // Generate UPI QR code URL using a QR code API
  const upiString = `upi://pay?pa=${upiId}&pn=${upiName}&am=${amountPaise}&tn=${note}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`;

  function copyUpiId() {
    navigator.clipboard.writeText(upiId).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  }

  function copyUpiLink() {
    navigator.clipboard.writeText(upiString).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  function downloadQrCode() {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `upi-qr-${bookingRef}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-5">
      {/* Amount banner */}
      <div className="rounded-lg bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-accent)]/5 border border-[var(--color-accent)]/30 p-6 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-2">
          Advance Payment Due
        </p>
        <p className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-[var(--color-accent)]">
          {formatCurrency(amount)}
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Reference: <span className="font-mono font-medium text-[var(--color-foreground)]">{note}</span>
        </p>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* UPI ID Card */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Pay to UPI ID
            </p>
            <button
              onClick={copyUpiId}
              className="flex items-center gap-1.5 rounded-md bg-[var(--color-accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)]/20 min-h-[36px]"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="space-y-3">
            <div className="rounded-md bg-[var(--color-muted)]/30 p-3">
              <span className="font-mono text-base font-semibold text-[var(--color-foreground)] break-all">
                {upiId}
              </span>
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Beneficiary: <span className="font-medium text-[var(--color-foreground)]">{upiName}</span>
            </p>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Scan QR Code
            </p>
            <button
              onClick={() => setShowQr(!showQr)}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] hover:underline"
            >
              {showQr ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>
          {showQr && (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full aspect-square max-w-[200px] bg-white rounded-lg p-3 shadow-md">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={copyUpiLink}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-2 text-xs font-medium transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <button
                  onClick={downloadQrCode}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-2 text-xs font-medium transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pay with apps */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-4">
          Quick Pay with Apps
        </p>
        <div className="grid grid-cols-3 gap-3">
          <a
            href={gpayLink}
            className="group flex flex-col items-center gap-2 rounded-lg border border-[var(--color-border)] p-4 text-center text-xs font-medium hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all min-h-[100px] justify-center"
          >
            <div className="rounded-full bg-[var(--color-accent)]/10 p-2 group-hover:bg-[var(--color-accent)]/20 transition-colors">
              <Smartphone className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <span className="font-medium">Google Pay</span>
          </a>
          <a
            href={phonepeLink}
            className="group flex flex-col items-center gap-2 rounded-lg border border-[var(--color-border)] p-4 text-center text-xs font-medium hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all min-h-[100px] justify-center"
          >
            <div className="rounded-full bg-[var(--color-accent)]/10 p-2 group-hover:bg-[var(--color-accent)]/20 transition-colors">
              <Smartphone className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <span className="font-medium">PhonePe</span>
          </a>
          <a
            href={upiLink}
            className="group flex flex-col items-center gap-2 rounded-lg border border-[var(--color-border)] p-4 text-center text-xs font-medium hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all min-h-[100px] justify-center"
          >
            <div className="rounded-full bg-[var(--color-accent)]/10 p-2 group-hover:bg-[var(--color-accent)]/20 transition-colors">
              <ExternalLink className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <span className="font-medium">Any UPI App</span>
          </a>
        </div>
      </div>

      {submitted ? (
        <div className="rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 p-5 text-sm text-[var(--color-accent)]">
          Payment details submitted. We will confirm your booking after we verify the receipt.
        </div>
      ) : (
        <form
          className="rounded-lg bg-[var(--color-muted)]/30 border border-[var(--color-border)] p-5 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setSubmitError(null);
            try {
              const form = event.currentTarget;
              const data = new FormData(form);
              data.set("booking_id", bookingId);
              data.set("utr", utr);
              const res = await fetch("/api/payments/upi-report", { method: "POST", body: data });
              const json = await res.json();
              if (!res.ok) throw new Error(json.error ?? "Could not submit payment details");
              setSubmitted(true);
            } catch (error) {
              setSubmitError(error instanceof Error ? error.message : "Could not submit payment details");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-foreground)]">
            I have paid
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Enter the UTR / UPI reference and optionally upload a screenshot so we can approve the receipt.
          </p>
          <input
            name="utr"
            value={utr}
            onChange={(event) => setUtr(event.target.value)}
            required
            minLength={4}
            placeholder="UTR or UPI reference"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
          />
          <input
            name="screenshot"
            type="file"
            accept="image/*"
            className="w-full text-sm text-[var(--color-muted-foreground)]"
          />
          {submitError ? <p className="text-sm text-[var(--color-destructive)]">{submitError}</p> : null}
          <Button type="submit" variant="accent" disabled={submitting || utr.trim().length < 4}>
            {submitting ? "Submitting…" : "Submit for verification"}
          </Button>
        </form>
      )}
    </div>
  );
}
