"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getAdminSettingsAction, updateAllSettingsAction } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminNotification } from "@/components/ui/admin-notification";
import type { SiteSettings, BookingSettings, PaymentSettings, ServiceSettings, CheckoutSettings } from "@/types";
import { Bell, Building2, Car, CreditCard, Settings } from "lucide-react";

type ImageRow = {
  id: string;
  currentUrl: string | null;
};

function createImageRows(urls: string[] | undefined) {
  return (urls?.length ? urls : []).map((url) => ({
    id: crypto.randomUUID(),
    currentUrl: url,
  }));
}

export function SettingsPageWrapper({
  initialSettings,
}: {
  initialSettings: {
    business: SiteSettings;
    booking: BookingSettings;
    payment: PaymentSettings;
    service: ServiceSettings;
    checkout: CheckoutSettings;
  };
}) {
  const router = useRouter();
  const { showNotification, NotificationComponent } = useAdminNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [showcaseImages, setShowcaseImages] = useState<ImageRow[]>(
    () => createImageRows(initialSettings.business.hero_image_urls),
  );

  const { business, booking, payment, service, checkout } = settings;

  useEffect(() => {
    setShowcaseImages(createImageRows(settings.business.hero_image_urls));
  }, [settings.business.hero_image_urls]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    showNotification("loading", "Saving settings...");

    try {
      const formData = new FormData(e.currentTarget);
      await updateAllSettingsAction(formData);
      showNotification("success", "Settings saved successfully!");

      // Refresh the router to get fresh data
      router.refresh();

      // Reload settings to reflect changes
      const updatedSettings = await getAdminSettingsAction();
      setSettings(updatedSettings);
    } catch {
      showNotification("error", "Failed to save settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      {NotificationComponent}
        <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-accent)">Owner settings</p>
            <h1 className="mt-1 font-[family-name:var(--font-heading)] text-3xl text-(--color-foreground) sm:text-4xl">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-(--color-muted-foreground)">
              Business details, booking rules, payments, and travel fees for the public site.
            </p>
          </div>
        </div>

        <form id="settings-form" onSubmit={handleSubmit} className="space-y-5" aria-busy={isSubmitting}>
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-card)">
              <header className="border-b border-(--color-border) bg-(--color-muted)/30 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-(--color-secondary)" aria-hidden="true" />
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-xl text-(--color-foreground)">Business information</h2>
                    <p className="mt-1 text-xs text-(--color-muted-foreground)">Your business details and contact information.</p>
                  </div>
                </div>
              </header>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="sm:col-span-2"><Label htmlFor="business-name">Business Name</Label><Input id="business-name" name="business_name" defaultValue={business.business_name} className="mt-1.5" /></div>
                <div><Label htmlFor="business-email">Email</Label><Input id="business-email" name="email" type="email" defaultValue={business.email} className="mt-1.5" /></div>
                <div><Label htmlFor="business-phone">Phone</Label><Input id="business-phone" name="phone" defaultValue={business.phone} className="mt-1.5" /></div>
                <div><Label htmlFor="business-whatsapp">WhatsApp</Label><Input id="business-whatsapp" name="whatsapp" defaultValue={business.whatsapp} className="mt-1.5" /></div>
                <div><Label htmlFor="business-instagram">Instagram</Label><Input id="business-instagram" name="instagram" defaultValue={business.instagram} className="mt-1.5" /></div>
                <div className="sm:col-span-2"><Label htmlFor="business-review">Google Review URL</Label><Input id="business-review" name="google_review_url" type="url" placeholder="https://g.page/r/..." defaultValue={business.google_review_url ?? ""} className="mt-1.5" /></div>
                <div className="sm:col-span-2"><Label htmlFor="business-address">Address</Label><Textarea id="business-address" name="address" defaultValue={business.address} rows={3} className="mt-1.5" /></div>
                <div className="sm:col-span-2 border-t border-(--color-border) pt-4">
                  <p className="text-sm font-semibold text-(--color-foreground)">Brand images</p>
                  <p className="mt-1 text-xs text-(--color-muted-foreground)">
                    Update the admin login image plus one shared gallery used on both the homepage cards and the footer strip.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <ImageUploadField
                    id="admin-login-image"
                    name="admin_login_image_file"
                    label="Admin login image"
                    currentUrl={business.admin_login_image_url}
                    clearName="admin_login_image_clear"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-(--color-foreground)">Homepage + footer gallery</p>
                    <p className="mt-1 text-xs text-(--color-muted-foreground)">
                      Add, replace, or remove images. The same list is used in both places.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowcaseImages((current) => [
                        ...current,
                        { id: crypto.randomUUID(), currentUrl: null },
                      ])
                    }
                  >
                    Add image
                  </Button>
                </div>
                <input type="hidden" name="hero_image_slots" value={showcaseImages.length} />
                <div className="sm:col-span-2 grid gap-4 lg:grid-cols-2">
                  {showcaseImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="rounded-(--radius-lg) border border-(--color-border) p-3"
                    >
                      <input
                        type="hidden"
                        name={`hero_image_current_${index}`}
                        value={image.currentUrl ?? ""}
                      />
                      <ImageUploadField
                        id={`hero-image-${image.id}`}
                        name={`hero_image_file_${index}`}
                        label={`Gallery image ${index + 1}`}
                        currentUrl={image.currentUrl}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowcaseImages((current) =>
                              current.filter((item) => item.id !== image.id),
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-card)">
              <header className="border-b border-(--color-border) bg-(--color-muted)/30 px-5 py-4">
                <div className="flex items-start gap-3">
                  <Settings className="mt-0.5 h-5 w-5 shrink-0 text-(--color-secondary)" aria-hidden="true" />
                  <div className="min-w-0">
                    <h2 className="font-[family-name:var(--font-heading)] text-xl text-(--color-foreground)">Booking rules</h2>
                    <p className="mt-1 text-xs leading-relaxed text-(--color-muted-foreground)">
                      These numbers control the public calendar. The policy text is shown when a customer books or cancels.
                    </p>
                  </div>
                </div>
              </header>
              <div className="space-y-5 p-5">
                <div className="grid gap-4 sm:grid-cols-2 sm:items-stretch">
                  <div className="flex min-w-0 flex-col">
                    <Label htmlFor="min-advance" className="min-h-10 leading-snug">
                      Minimum notice (hours)
                    </Label>
                    <Input
                      id="min-advance"
                      name="min_advance_hours"
                      type="number"
                      min={0}
                      defaultValue={booking.min_advance_hours}
                      className="mt-1.5"
                    />
                    <p className="mt-1.5 min-h-10 text-xs leading-relaxed text-(--color-muted-foreground)">
                      How far ahead a customer must book. Example: 48 means they cannot pick today or tomorrow.
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <Label htmlFor="hold-duration" className="min-h-10 leading-snug">
                      Hold duration (hours)
                    </Label>
                    <Input
                      id="hold-duration"
                      name="hold_duration_hours"
                      type="number"
                      min={0}
                      step="0.25"
                      defaultValue={booking.hold_duration_hours}
                      className="mt-1.5"
                    />
                    <p className="mt-1.5 min-h-10 text-xs leading-relaxed text-(--color-muted-foreground)">
                      How long the slot stays reserved after they submit, while you approve. 0.25 = 15 minutes.
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <Label htmlFor="buffer-hours" className="min-h-10 leading-snug">
                      Prep buffer (hours)
                    </Label>
                    <Input
                      id="buffer-hours"
                      name="buffer_hours"
                      type="number"
                      min={0}
                      step="0.25"
                      defaultValue={booking.buffer_hours}
                      className="mt-1.5"
                    />
                    <p className="mt-1.5 min-h-10 text-xs leading-relaxed text-(--color-muted-foreground)">
                      Extra time after every job to reset kits. Not travel. 0.5 = 30 minutes.
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <Label htmlFor="travel-buffer" className="min-h-10 leading-snug">
                      Travel buffer (hours)
                    </Label>
                    <Input
                      id="travel-buffer"
                      name="travel_buffer_hours"
                      type="number"
                      min={0}
                      step="0.25"
                      defaultValue={booking.travel_buffer_hours}
                      className="mt-1.5"
                    />
                    <p className="mt-1.5 min-h-10 text-xs leading-relaxed text-(--color-muted-foreground)">
                      Extra gap when a home visit is involved. Example: 2h makeup + 2h travel + 0.5h prep means the next home booking cannot start until 4.5 hours after the first one began.
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cancellation-policy">Cancellation policy</Label>
                  <Textarea
                    id="cancellation-policy"
                    name="cancellation_policy"
                    defaultValue={booking.cancellation_policy}
                    rows={5}
                    className="mt-1.5"
                  />
                  <p className="mt-1.5 text-xs leading-relaxed text-(--color-muted-foreground)">
                    Shown on the booking form. Refunds are still decided by you. Under 7 days to the event, the site tells the customer the advance is not returned unless you choose otherwise.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-card)">
              <header className="border-b border-(--color-border) bg-(--color-muted)/30 px-5 py-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-(--color-secondary)" aria-hidden="true" />
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-xl text-(--color-foreground)">Payments and deposits</h2>
                    <p className="mt-1 text-xs text-(--color-muted-foreground)">Payment methods and advance requirements.</p>
                  </div>
                </div>
              </header>
              <div className="space-y-4 p-5">
                <div><Label htmlFor="upi-id">Your UPI ID</Label><Input id="upi-id" name="upi_id" placeholder="yourname@upi" defaultValue={payment.upi_id ?? ""} className="mt-1.5 font-mono" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label htmlFor="payment-mode">Advance Mode</Label><select id="payment-mode" name="mode" defaultValue={payment.mode} className="mt-1.5 flex h-11 w-full rounded-sm border border-(--color-border) bg-(--color-card) px-4 text-sm text-(--color-foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)"><option value="ADVANCE_PERCENTAGE">Percentage</option><option value="FIXED_ADVANCE">Fixed Amount</option></select></div>
                  <div><Label htmlFor="advance-percentage">Advance Percentage (%)</Label><Input id="advance-percentage" name="advance_percentage" type="number" min={0} max={100} defaultValue={payment.advance_percentage} className="mt-1.5" /></div>
                  <div className="sm:col-span-2"><Label htmlFor="fixed-advance">Fixed Advance Amount (₹)</Label><Input id="fixed-advance" name="fixed_advance" type="number" min={0} defaultValue={payment.fixed_advance} className="mt-1.5" /></div>
                </div>
                <fieldset className="border-t border-(--color-border) pt-4">
                  <legend className="text-sm font-semibold text-(--color-foreground)">Coupons at checkout</legend>
                  <p className="mt-1 text-xs text-(--color-muted-foreground)">Allow customers to apply a coupon during checkout.</p>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-(--radius-md) border border-(--color-border) px-3 text-sm"><input type="radio" name="coupons_enabled" value="true" defaultChecked={checkout.coupons_enabled} className="accent-(--color-accent)" /> Enabled</label>
                    <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-(--radius-md) border border-(--color-border) px-3 text-sm"><input type="radio" name="coupons_enabled" value="false" defaultChecked={!checkout.coupons_enabled} className="accent-(--color-accent)" /> Disabled</label>
                  </div>
                  <p className="mt-3 text-xs text-(--color-muted-foreground)">{checkout.coupons_enabled ? "Coupon entry is available at checkout." : "Coupon entry is hidden at checkout."}</p>
                </fieldset>
              </div>
            </section>

            <section className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-card)">
              <header className="border-b border-(--color-border) bg-(--color-muted)/30 px-5 py-4"><div className="flex items-center gap-3"><Car className="h-5 w-5 text-(--color-secondary)" aria-hidden="true" /><div><h2 className="font-[family-name:var(--font-heading)] text-xl text-(--color-foreground)">Travel charges</h2><p className="mt-1 text-xs text-(--color-muted-foreground)">Home service travel fee configuration.</p></div></div></header>
              <div className="space-y-4 p-5">
                <input type="hidden" name="home_service_enabled" value="true" />
                <input type="hidden" name="travel_charge_base" value="0" />
                <input type="hidden" name="travel_charge_per_km" value="0" />
                <p className="border-b border-(--color-border) pb-4 text-xs leading-relaxed text-(--color-muted-foreground)"><strong className="text-(--color-foreground)">Beyond the free radius:</strong> A fixed fee will be applied instead of per-km charges.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label htmlFor="travel-radius">Free Radius (km)</Label><Input id="travel-radius" name="travel_radius_km" type="number" min={0} defaultValue={service.travel_radius_km} className="mt-1.5" /></div>
                  <div><Label htmlFor="long-distance-fee">Fixed Fee over Radius (₹)</Label><Input id="long-distance-fee" name="long_distance_fixed_fee" type="number" min={0} defaultValue={service.long_distance_fixed_fee} className="mt-1.5" /></div>
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-3 border-t border-(--color-border) pt-5">
            <Link href="/admin/settings/notifications" className="group flex items-center gap-3 border-b border-(--color-border) py-3 text-sm"><Bell className="h-5 w-5 text-(--color-secondary)" aria-hidden="true" /><span className="flex-1"><span className="editorial-link font-semibold text-(--color-foreground)">Notification delivery</span><span className="mt-1 block text-xs text-(--color-muted-foreground)">Review email, SMS, and WhatsApp delivery status.</span></span><span aria-hidden="true" className="text-lg text-(--color-muted-foreground) transition-transform group-hover:translate-x-1">↗</span></Link>
          </div>

          <div className="flex justify-end pt-1">
            <Button 
              type="submit" 
              form="settings-form" 
              variant="default" 
              size="lg"
              loading={isSubmitting}
            >
              Save changes
            </Button>
          </div>
        </form>

        <Link href="/admin" className="text-sm text-(--color-accent) underline-offset-4 hover:underline">← Back to dashboard</Link>
        </div>
    </>
  );
}
