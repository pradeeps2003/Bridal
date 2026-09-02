import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateAllSettingsAction,
} from "@/app/admin/actions";
import { getAllSettings } from "@/lib/data/settings";
import { getCurrentAdmin } from "@/lib/data/admin";
import { Bell, Building2, Car, CreditCard, Settings, Users } from "lucide-react";



export default async function AdminSettingsPage() {
  const session = await getCurrentAdmin();
  if (session?.admin.role !== "owner") redirect("/admin/settings/team");
  const { business, booking, payment, service } = await getAllSettings();

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold">Settings</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              Configure your business operations, booking rules, and payment settings
            </p>
          </div>
        </div>

        {/* Unified Settings Form */}
        <form action={updateAllSettingsAction} className="space-y-4">
          <div className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Business Information */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden hover:border-[var(--color-accent)]/30 transition-all hover:shadow-lg">
              <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-muted)]/30 to-transparent px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 p-1.5 sm:p-2 shadow-sm">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-sm sm:text-base font-semibold">Business Information</h2>
                    <p className="text-[10px] sm:text-xs text-[var(--color-muted-foreground)] hidden sm:block">Your business details and contact information</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 grid gap-2 sm:gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="text-[10px] sm:text-xs font-medium">Business Name</Label>
                  <Input
                    name="business_name"
                    defaultValue={business.business_name}
                    className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-[var(--color-accent)]/20"
                  />
                </div>
                <div>
                  <Label className="text-[10px] sm:text-xs font-medium">Email</Label>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={business.email}
                    className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-[var(--color-accent)]/20"
                  />
                </div>
                <div>
                  <Label className="text-[10px] sm:text-xs font-medium">Phone</Label>
                  <Input name="phone" defaultValue={business.phone} className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-[var(--color-accent)]/20" />
                </div>
                <div>
                  <Label className="text-[10px] sm:text-xs font-medium">WhatsApp</Label>
                  <Input name="whatsapp" defaultValue={business.whatsapp} className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-[var(--color-accent)]/20" />
                </div>
                <div>
                  <Label className="text-[10px] sm:text-xs font-medium">Instagram</Label>
                  <Input name="instagram" defaultValue={business.instagram} className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-[var(--color-accent)]/20" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[10px] sm:text-xs font-medium">Google Review URL</Label>
                  <Input
                    name="google_review_url"
                    type="url"
                    placeholder="https://g.page/r/..."
                    defaultValue={
                      (business as { google_review_url?: string }).google_review_url ?? ""
                    }
                    className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-[var(--color-accent)]/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[10px] sm:text-xs font-medium">Address</Label>
                  <Textarea
                    name="address"
                    defaultValue={business.address}
                    className="mt-1 text-xs sm:text-sm focus:ring-2 focus:ring-[var(--color-accent)]/20"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Booking Rules */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden hover:border-[var(--color-accent)]/30 transition-all hover:shadow-lg">
              <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-blue-500/10 to-transparent px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-1.5 sm:p-2 shadow-sm">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-sm sm:text-base font-semibold">Booking Rules</h2>
                    <p className="text-[10px] sm:text-xs text-[var(--color-muted-foreground)] hidden sm:block">Availability, timing, and cancellation policies</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 grid gap-2 sm:gap-3 sm:grid-cols-3">
                <div>
                  <Label className="text-[10px] sm:text-xs font-medium">Min Advance (Hours)</Label>
                  <Input
                    name="min_advance_hours"
                    type="number"
                    defaultValue={booking.min_advance_hours}
                    className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[9px] sm:text-[10px] text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1">Minimum booking notice</p>
                </div>
                <div>
                  <Label className="text-[10px] sm:text-xs font-medium">Hold Duration (Hours)</Label>
                  <Input
                    name="hold_duration_hours"
                    type="number"
                    step="0.25"
                    defaultValue={booking.hold_duration_hours}
                    className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[9px] sm:text-[10px] text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1">Slot reservation time</p>
                </div>
                <div>
                  <Label className="text-[10px] sm:text-xs font-medium">Buffer Time (Hours)</Label>
                  <Input
                    name="buffer_hours"
                    type="number"
                    step="0.25"
                    defaultValue={booking.buffer_hours}
                    className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[9px] sm:text-[10px] text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1">Time between bookings</p>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-[10px] sm:text-xs font-medium">Cancellation Policy</Label>
                  <Textarea
                    name="cancellation_policy"
                    defaultValue={booking.cancellation_policy}
                    className="mt-1 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden hover:border-[var(--color-accent)]/30 transition-all hover:shadow-lg">
              <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-green-500/10 to-transparent px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 p-1.5 sm:p-2 shadow-sm">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-sm sm:text-base font-semibold">Payment Settings</h2>
                    <p className="text-[10px] sm:text-xs text-[var(--color-muted-foreground)] hidden sm:block">Payment methods and advance requirements</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 p-2 sm:p-3 space-y-2 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                    <p className="text-[10px] sm:text-xs font-semibold text-green-700 dark:text-green-400">Free UPI Integration</p>
                  </div>
                  <div>
                    <Label className="text-[10px] sm:text-xs font-medium">Your UPI ID</Label>
                    <Input
                      name="upi_id"
                      placeholder="yourname@upi"
                      defaultValue={(payment as { upi_id?: string }).upi_id ?? ""}
                      className="mt-1 text-xs sm:text-sm font-mono h-8 sm:h-9 focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                </div>
                <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-[10px] sm:text-xs font-medium">Advance Mode</Label>
                    <select
                      name="mode"
                      defaultValue={payment.mode}
                      className="mt-1 w-full h-8 sm:h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-xs sm:text-sm focus:ring-2 focus:ring-green-500/20"
                    >
                      <option value="ADVANCE_PERCENTAGE">Percentage</option>
                      <option value="FIXED_ADVANCE">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] sm:text-xs font-medium">Advance Percentage (%)</Label>
                    <Input
                      name="advance_percentage"
                      type="number"
                      defaultValue={payment.advance_percentage}
                      className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-[10px] sm:text-xs font-medium">Fixed Advance Amount (₹)</Label>
                    <Input
                      name="fixed_advance"
                      type="number"
                      defaultValue={payment.fixed_advance}
                      className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Charges */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden hover:border-[var(--color-accent)]/30 transition-all hover:shadow-lg">
              <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-orange-500/10 to-transparent px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 p-1.5 sm:p-2 shadow-sm">
                    <Car className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-sm sm:text-base font-semibold">Travel Charges</h2>
                    <p className="text-[10px] sm:text-xs text-[var(--color-muted-foreground)] hidden sm:block">Home service travel fee configuration</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <input type="hidden" name="home_service_enabled" value="true" />

                <div className="rounded-lg border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-accent)]/5 p-2 sm:p-3 shadow-sm">
                  <p className="text-[10px] sm:text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                    <strong className="text-[var(--color-foreground)]">How it works:</strong> Home service is free within the radius. Beyond it, you charge:
                    <br />
                    <span className="font-mono text-[var(--color-accent)]">Base fee + (km over radius) × per-km rate</span>
                  </p>
                </div>

                <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-[10px] sm:text-xs font-medium">Free Radius (km)</Label>
                    <Input
                      name="travel_radius_km"
                      type="number"
                      min={0}
                      defaultValue={
                        (service as { travel_radius_km?: number }).travel_radius_km ?? 40
                      }
                      className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-orange-500/20"
                    />
                    <p className="text-[9px] sm:text-[10px] text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1">No fee within this distance</p>
                  </div>
                  <div>
                    <Label className="text-[10px] sm:text-xs font-medium">Base Travel Fee (₹)</Label>
                    <Input
                      name="travel_charge_base"
                      type="number"
                      min={0}
                      defaultValue={service.travel_charge_base}
                      className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-orange-500/20"
                    />
                    <p className="text-[9px] sm:text-[10px] text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1">One-time charge over radius</p>
                  </div>
                  <div>
                    <Label className="text-[10px] sm:text-xs font-medium">Per Km Rate (₹)</Label>
                    <Input
                      name="travel_charge_per_km"
                      type="number"
                      min={0}
                      defaultValue={service.travel_charge_per_km}
                      className="mt-1 text-xs sm:text-sm h-8 sm:h-9 focus:ring-2 focus:ring-orange-500/20"
                    />
                    <p className="text-[9px] sm:text-[10px] text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1">Charged per extra kilometre</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 grid gap-3 sm:grid-cols-2">
              <Link href="/admin/settings/team" className="group flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 sm:p-4 transition-all hover:border-purple-500/50 hover:shadow-lg hover:bg-purple-50/5 dark:hover:bg-purple-900/10">
                <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 p-1.5 sm:p-2 shadow-sm group-hover:shadow-md transition-shadow">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <span className="block text-xs sm:text-sm font-semibold text-[var(--color-foreground)]">Team & Permissions</span>
                  <span className="mt-1 block text-[10px] sm:text-xs text-[var(--color-muted-foreground)]">Manage owner and staff access levels</span>
                </div>
              </Link>
              <Link href="/admin/settings/notifications" className="group flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 sm:p-4 transition-all hover:border-yellow-500/50 hover:shadow-lg hover:bg-yellow-50/5 dark:hover:bg-yellow-900/10">
                <div className="rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 p-1.5 sm:p-2 shadow-sm group-hover:shadow-md transition-shadow">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <span className="block text-xs sm:text-sm font-semibold text-[var(--color-foreground)]">Notification Delivery</span>
                  <span className="mt-1 block text-[10px] sm:text-xs text-[var(--color-muted-foreground)]">Review email, SMS, and WhatsApp delivery status</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Common Save Button */}
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="accent" size="lg" className="h-10 sm:h-11 text-sm shadow-md hover:shadow-lg">
              Save All Settings
            </Button>
          </div>
        </form>

        <div className="pt-2">
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--color-accent)] hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
