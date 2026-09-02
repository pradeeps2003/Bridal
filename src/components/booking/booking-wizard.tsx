"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  CreditCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isNegotiableAddon, visibleBookingAddons } from "@/lib/addons/pricing";
import { getWhatsAppUrl, resolveWhatsAppNumber } from "@/lib/whatsapp";
import { calculateBookingPrice } from "@/lib/pricing/calculate";
import { formatCurrency } from "@/lib/utils";
import type {
  Addon,
  BookingSettings,
  Package,
  PaymentSettings,
  Service,
  ServiceSettings,
  SiteSettings,
  TimeSlot,
} from "@/types";

const STEPS = [
  { label: "Choose Service", hint: "Select your makeup service" },
  { label: "Select Package", hint: "Pick your package & extras" },
  { label: "Schedule", hint: "Date, time & location" },
  { label: "Confirm", hint: "Review & book" },
];

interface BookingWizardProps {
  services: Service[];
  packages: Package[];
  addons: Addon[];
  bookingSettings: BookingSettings;
  paymentSettings: PaymentSettings;
  serviceSettings: ServiceSettings;
  businessSettings: SiteSettings;
  preselectedPackage?: string;
}

function fieldClass(active: boolean) {
  return `h-full min-h-[7.5rem] rounded-2xl border p-4 text-left transition-colors cursor-pointer ${
    active
      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/8"
      : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)]/50"
  }`;
}

export function BookingWizard({
  services,
  packages,
  addons,
  bookingSettings,
  paymentSettings,
  serviceSettings,
  businessSettings,
  preselectedPackage,
}: BookingWizardProps) {
  const searchParams = useSearchParams();
  const initialPackage = preselectedPackage ?? searchParams.get("package") ?? "";

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [locationType, setLocationType] = useState<"home" | "studio">("home");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (!initialPackage) return;
    const pkg = packages.find((p) => p.slug === initialPackage);
    if (!pkg) return;
    setPackageId(pkg.id);
    setServiceId(pkg.service_id);
  }, [initialPackage, packages]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const filteredPackages = useMemo(
    () => packages.filter((p) => p.service_id === serviceId),
    [packages, serviceId],
  );

  const selectedPackage = packages.find((p) => p.id === packageId);
  const selectedAddonItems = visibleBookingAddons(addons).filter((a) => selectedAddons.includes(a.id));
  const selectedService = services.find((s) => s.id === serviceId);

  const pricing = useMemo(() => {
    if (!selectedPackage) return null;
    return calculateBookingPrice({
      pkg: selectedPackage,
      addons: selectedAddonItems,
      locationType,
      serviceSettings,
      paymentSettings,
    });
  }, [selectedPackage, selectedAddonItems, locationType, serviceSettings, paymentSettings]);

  const finalTotal = pricing ? Math.max(0, pricing.total - couponDiscount) : 0;
  const finalAdvance = pricing ? Math.max(0, pricing.advance - couponDiscount) : 0;

  const loadSlots = useCallback(async () => {
    if (!packageId || !eventDate) return;
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await fetch(`/api/availability?date=${eventDate}&package_id=${packageId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load slots");
      setSlots(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load availability");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [packageId, eventDate]);

  useEffect(() => {
    if (step === 2 && eventDate && packageId) loadSlots();
  }, [step, eventDate, packageId, loadSlots]);

  function toggleAddon(id: string) {
    setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  function validateContact() {
    const nextErrors: Record<string, string> = {};
    if (fullName.trim().length < 2) nextErrors.fullName = "Please enter your full name";
    if (!/^(?:\+?91[-\s]?)?[6-9]\d{9}$/.test(phone.trim())) nextErrors.phone = "Please enter a valid Indian phone number";
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Please enter a valid email address";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function applyCoupon() {
    if (!couponCode.trim() || !pricing) return;
    
    setCouponError(null);
    setCouponApplied(false);
    setCouponDiscount(0);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          package_id: packageId,
          total_amount: pricing.total,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Invalid coupon code");
      }

      setCouponApplied(true);
      setCouponDiscount(json.discount || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid coupon code";
      setCouponError(message);
    }
  }

  async function handleSubmit() {
    if (!selectedPackage) return;
    if (!validateContact()) {
      setFeedback({ title: "Check your details", message: "Please correct the highlighted fields before opening WhatsApp." });
      return;
    }

    const whatsappNumber = resolveWhatsAppNumber(
      businessSettings.whatsapp || businessSettings.phone,
    );

    if (!whatsappNumber) {
      const message = "WhatsApp booking is not configured yet. Please contact us directly.";
      setError(message);
      setFeedback({ title: "WhatsApp is unavailable", message });
      return;
    }

    setError(null);
    setSubmitting(true);

    let bookingRef = "";

    try {
      const payload = {
        package_id: packageId,
        addon_ids: selectedAddons,
        event_date: eventDate,
        start_time: startTime,
        location_type: locationType,
        address: locationType === "home" ? address : undefined,
        pincode: locationType === "home" ? pincode : undefined,
        notes: notes.trim() || undefined,
        coupon_code: couponApplied ? couponCode.trim() : undefined,
        customer: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          whatsapp: phone.trim(),
        },
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.data?.id) {
        bookingRef = resData.data.id.slice(0, 8).toUpperCase();
      }
    } catch (err) {
      console.warn("[booking-wizard] Failed to save booking to DB, falling back to direct WhatsApp:", err);
    }

    const addonSummary = selectedAddonItems.length
      ? selectedAddonItems
          .map((addon) => `${addon.name}${isNegotiableAddon(addon) ? " (to quote)" : ""}`)
          .join(", ")
      : "None";
    const locationSummary = locationType === "home" ? `${address} (${pincode})` : "Studio";
    const totalSummary = pricing?.is_custom_quote ? "Custom quote" : formatCurrency(finalTotal);
    const advanceSummary =
      pricing && !pricing.is_custom_quote && finalAdvance > 0
        ? formatCurrency(finalAdvance)
        : "To confirm";

    const message = [
      "Hi Glow with Rubi! I would like to book a makeup appointment.",
      "",
      bookingRef ? `*Booking Ref:* #${bookingRef}` : null,
      `*Name:* ${fullName.trim()}`,
      `*Phone:* ${phone.trim()}`,
      email.trim() ? `*Email:* ${email.trim()}` : null,
      `*Service:* ${selectedService?.name ?? "Makeup service"}`,
      `*Package:* ${selectedPackage.name}`,
      `*Date:* ${eventDate} at ${startTime}`,
      `*Location:* ${locationSummary}`,
      `*Add-ons:* ${addonSummary}`,
      `*Total shown:* ${totalSummary}`,
      `*Advance shown:* ${advanceSummary}`,
      couponApplied && couponCode.trim() ? `*Coupon:* ${couponCode.trim()}` : null,
      notes.trim() ? `*Notes:* ${notes.trim()}` : null,
      "",
      "Please confirm availability and the final price. I will tap Send here to submit this request.",
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.assign(getWhatsAppUrl(whatsappNumber, message));
  }

  const minDate = new Date(Date.now() + bookingSettings.min_advance_hours * 3600000).toISOString().slice(0, 10);
  const canLeaveService = Boolean(serviceId);
  const canLeavePackage = Boolean(packageId);
  const canLeaveSchedule =
    Boolean(eventDate && startTime) && (locationType === "studio" || (address.trim() && pincode.length === 6));
  const canSubmit = Boolean(fullName.trim() && phone.trim());

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:p-8">
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Booking progress">
        {STEPS.map((item, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li
              key={item.label}
              className={`rounded-xl border px-2 py-2 text-center ${
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-[var(--color-border)]"
              }`}
            >
              <span
                className={`mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  active || done
                    ? "bg-[var(--color-accent)] text-[var(--color-on-accent)]"
                    : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <p className="text-[10px] font-semibold text-[var(--color-foreground)] hidden sm:block">{item.label}</p>
              <p className="text-[9px] text-[var(--color-muted-foreground)] sm:hidden">{i + 1}</p>
            </li>
          );
        })}
      </ol>

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl">Choose Service</h2>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Select the type of makeup service you need
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setServiceId(service.id);
                  const related = packages.filter((p) => p.service_id === service.id);
                  setPackageId(related.length === 1 ? related[0].id : "");
                }}
                className={fieldClass(serviceId === service.id)}
              >
                <span className="block text-sm font-semibold text-[var(--color-foreground)]">{service.name}</span>
                {service.description && (
                  <span className="mt-2 block text-xs text-[var(--color-muted-foreground)]">
                    {service.description}
                  </span>
                )}
              </button>
            ))}
          </div>

          <Button variant="accent" disabled={!canLeaveService} onClick={() => { setStep(1); scrollToTop(); }} className="h-10 w-full">
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl">Select Package</h2>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Choose your package and any optional extras
            </p>
          </div>

          {/* Package Selection */}
          {filteredPackages.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No packages available for this service.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredPackages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setPackageId(pkg.id)}
                  className={fieldClass(packageId === pkg.id)}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-[var(--color-foreground)]">
                        {pkg.name}
                      </span>
                      {pkg.description && (
                        <span className="mt-1 block text-xs text-[var(--color-muted-foreground)] line-clamp-2">
                          {pkg.description}
                        </span>
                      )}
                      <span className="mt-2 flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                        <Clock className="w-3 h-3" />
                        {pkg.duration_hours} hrs
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-[var(--color-accent)]">
                      {pkg.pricing_type === "CUSTOM_QUOTE"
                        ? "Quote"
                        : pkg.pricing_type === "STARTING_FROM"
                          ? `From ${formatCurrency(pkg.price)}`
                          : formatCurrency(pkg.price)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Price Display */}
          {selectedPackage && (
            <div className="rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[var(--color-muted-foreground)]">
                    {selectedPackage.name}
                  </p>
                  <p className="text-lg font-semibold text-[var(--color-foreground)]">
                    {selectedPackage.pricing_type === "CUSTOM_QUOTE"
                      ? "Custom Quote"
                      : selectedPackage.pricing_type === "STARTING_FROM"
                        ? `From ${formatCurrency(selectedPackage.price)}`
                        : formatCurrency(selectedPackage.price)}
                  </p>
                </div>
                {selectedPackage.inclusions && selectedPackage.inclusions.length > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] font-medium text-[var(--color-muted-foreground)] mb-1">Includes:</p>
                    <ul className="space-y-0.5">
                      {selectedPackage.inclusions.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1 text-[10px] text-[var(--color-muted-foreground)]">
                          <Check className="w-2.5 h-2.5 text-[var(--color-accent)]" />
                          {item}
                        </li>
                      ))}
                      {selectedPackage.inclusions.length > 2 && (
                        <li className="text-[10px] text-[var(--color-accent)] font-medium">
                          +{selectedPackage.inclusions.length - 2} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Addons */}
          {visibleBookingAddons(addons).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Optional extras</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Hair extensions, jewellery, and extra draping are quoted after we see the look
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {visibleBookingAddons(addons).map((addon) => (
                  <label key={addon.id} className={`${fieldClass(selectedAddons.includes(addon.id))} min-h-0 cursor-pointer`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedAddons.includes(addon.id)}
                      onChange={() => toggleAddon(addon.id)}
                    />
                    <span className="flex items-start justify-between gap-2">
                      <span className="flex-1">
                        <span className="block text-xs font-semibold">{addon.name}</span>
                        <span className="mt-0.5 block text-[10px] text-[var(--color-muted-foreground)] line-clamp-1">{addon.description}</span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-[var(--color-accent)]">
                        {isNegotiableAddon(addon) ? "Quote" : formatCurrency(addon.price)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="h-10" onClick={() => { setStep(0); scrollToTop(); }}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button variant="accent" className="h-10 flex-1" disabled={!canLeavePackage} onClick={() => { setStep(2); scrollToTop(); }}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl">Schedule</h2>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Choose venue, date and time
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(["home", "studio"] as const).map((type) => (
              <button key={type} type="button" onClick={() => setLocationType(type)} className={fieldClass(locationType === type)}>
                <MapPin className={`mx-auto mb-2 h-5 w-5 ${locationType === type ? "text-[var(--color-accent)]" : "text-[var(--color-muted-foreground)]"}`} />
                <span className="block text-center text-sm font-semibold">
                  {type === "home" ? "Home service" : "In studio"}
                </span>
                <span className="mt-1 block text-center text-[10px] text-[var(--color-muted-foreground)]">
                  {type === "home"
                    ? `From ${formatCurrency(serviceSettings.travel_charge_base)} travel`
                    : "No travel fee"}
                </span>
              </button>
            ))}
          </div>

          {locationType === "home" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Venue address</Label>
                <Textarea
                  id="address"
                  placeholder="Apartment, street, landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          <DatePicker
            id="date"
            label="Event date"
            value={eventDate}
            onChange={(value) => {
              setEventDate(value);
              setStartTime("");
            }}
            min={minDate}
            required
          />

          {eventDate && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                Available times
              </Label>
              {loadingSlots ? (
                <p className="text-sm text-[var(--color-muted-foreground)]">Loading slots…</p>
              ) : slots.filter((s) => s.available).length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {slots
                    .filter((s) => s.available)
                    .map((slot) => (
                      <button
                        key={slot.start_time}
                        type="button"
                        onClick={() => setStartTime(slot.start_time.slice(0, 5))}
                        className={`h-9 rounded-lg border text-xs ${
                          startTime === slot.start_time.slice(0, 5)
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-on-accent)]"
                            : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
                        }`}
                      >
                        {slot.start_time.slice(0, 5)}
                      </button>
                    ))}
                </div>
              ) : (
                <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/50 p-3 text-xs text-[var(--color-muted-foreground)]">
                  {slots.length > 0
                    ? "Those hours are already taken. Please pick another day."
                    : "No open hours on this date. Try the next available day."}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="h-10" onClick={() => { setStep(1); scrollToTop(); }}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button variant="accent" className="h-10 flex-1" disabled={!canLeaveSchedule} onClick={() => { setStep(3); scrollToTop(); }}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && selectedPackage && pricing && (
        <div className="space-y-6">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl">Confirm Booking</h2>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Review your details and submit
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                aria-invalid={Boolean(fieldErrors.fullName)}
                aria-describedby={fieldErrors.fullName ? "name-error" : undefined}
                className="text-sm"
              />
              {fieldErrors.fullName && <p id="name-error" className="text-xs text-[var(--color-destructive)]">{fieldErrors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">Phone / WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                className="text-sm"
              />
              {fieldErrors.phone && <p id="phone-error" className="text-xs text-[var(--color-destructive)]">{fieldErrors.phone}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email" className="text-sm">Email<span className="text-[var(--color-muted-foreground)]">(optional)</span></Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                placeholder="you@example.com"
                className="text-sm"
              />
              {fieldErrors.email && <p id="email-error" className="text-xs text-[var(--color-destructive)]">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="coupon" className="text-sm">Coupon code</Label>
              <div className="flex gap-2">
                <Input 
                  id="coupon" 
                  value={couponCode} 
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError(null);
                    if (couponApplied) {
                      setCouponApplied(false);
                      setCouponDiscount(0);
                    }
                  }} 
                  className="text-sm flex-1"
                  placeholder="Enter code"
                  disabled={couponApplied}
                />
                {!couponApplied && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={applyCoupon}
                    disabled={!couponCode.trim()}
                    className="h-10"
                  >
                    Apply
                  </Button>
                )}
                {couponApplied && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setCouponApplied(false);
                      setCouponDiscount(0);
                      setCouponError(null);
                    }}
                    className="h-10 text-green-600"
                  >
                    Applied ✓
                  </Button>
                )}
              </div>
              {couponError && <p className="text-xs text-[var(--color-destructive)]">{couponError}</p>}
              {couponApplied && couponDiscount > 0 && (
                <p className="text-xs text-green-600">Coupon applied! You saved {formatCurrency(couponDiscount)}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-accent)]">Review</p>
            <p className="mt-1 font-[family-name:var(--font-heading)] text-lg">{selectedPackage.name}</p>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {selectedService?.name} · {eventDate} at {startTime} · {locationType === "home" ? `Home (${pincode})` : "Studio"}
            </p>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Package</span>
                <span>{pricing.is_custom_quote ? "Custom quote" : formatCurrency(pricing.subtotal)}</span>
              </div>
              {selectedAddonItems.map((a) => (
                <div key={a.id} className="flex justify-between text-[var(--color-muted-foreground)]">
                  <span>{a.name}</span>
                  <span>{isNegotiableAddon(a) ? "To quote" : formatCurrency(a.price)}</span>
                </div>
              ))}
              {pricing.travel_fee > 0 && (
                <div className="flex justify-between text-[var(--color-muted-foreground)]">
                  <span>Travel</span>
                  <span>{formatCurrency(pricing.travel_fee)}</span>
                </div>
              )}
              {couponApplied && couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon discount</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-semibold">
                <span>{pricing.has_negotiable_addons ? "Shown total" : "Total"}</span>
                <span className="text-[var(--color-accent)]">
                  {pricing.is_custom_quote ? "Custom quote" : formatCurrency(finalTotal)}
                </span>
              </div>
              {pricing.has_negotiable_addons && (
                <p className="text-[10px] text-[var(--color-muted-foreground)]">
                  Hair / jewellery extras are confirmed on WhatsApp after we see the look.
                </p>
              )}
              {!pricing.is_custom_quote && finalAdvance > 0 && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Advance due after approval
                  </span>
                  <span>{formatCurrency(finalAdvance)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-[var(--color-border)] p-3 text-[10px] text-[var(--color-muted-foreground)]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
            <p>
              No date is held automatically. WhatsApp will open with these details; tap Send to submit your request. Rubi will confirm availability, final pricing, and next steps.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="h-10" onClick={() => { setStep(2); scrollToTop(); }}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button variant="accent" className="h-10 flex-1" disabled={!canSubmit || submitting} onClick={handleSubmit}>
              {submitting ? "Opening WhatsApp…" : pricing.is_custom_quote ? "Request quote on WhatsApp" : "Book via WhatsApp"}
            </Button>
          </div>
        </div>
      )}
      <FeedbackDialog
        open={!!feedback}
        title={feedback?.title ?? ""}
        message={feedback?.message ?? ""}
        onClose={() => setFeedback(null)}
      />
    </div>
  );
}
