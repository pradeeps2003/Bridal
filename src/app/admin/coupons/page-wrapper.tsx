"use client";

import { useState, useTransition } from "react";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCoupon, deleteCoupon, updateCoupon } from "./actions";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import type { Coupon } from "@/types";

interface Props {
  coupons: Coupon[];
}

export function CouponsPageWrapper({ coupons }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; code: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {coupons.map((coupon) => (
        <Card
          key={coupon.id}
          className="flex flex-col hover:border-[var(--color-accent)]/50 transition-colors"
        >
          <CardHeader className="flex-1">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold font-mono tracking-wider text-[var(--color-foreground)]">
                {coupon.code}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-sm whitespace-nowrap ${coupon.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {coupon.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-2 font-medium">
              {coupon.type === "percent" ? `${coupon.value}% off` : `₹${coupon.value} off`}
              {coupon.min_order > 0 && ` (min ₹${coupon.min_order})`}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs border-t border-[var(--color-border)] pt-3">
              <span className="text-[var(--color-muted-foreground)]">
                Used: {coupon.used_count} / {coupon.max_uses ?? "∞"}
              </span>
              <span className="text-[var(--color-muted-foreground)] truncate max-w-[50%] text-right">
                {coupon.ends_at ? `Exp: ${new Date(coupon.ends_at).toLocaleDateString()}` : "No expiry"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[var(--color-accent)] border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10"
                onClick={() => setEditingId(coupon.id)}
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setItemToDelete({ id: coupon.id, code: coupon.code })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Card */}
      <button
        onClick={() => setAddingNew(true)}
        className="cursor-pointer min-h-48 rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-colors flex items-center justify-center p-6"
      >
        <div className="text-center">
          <Plus className="h-8 w-8 mx-auto text-[var(--color-accent)] mb-2" />
          <p className="text-sm font-medium text-[var(--color-foreground)]">Add Coupon</p>
        </div>
      </button>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-[var(--color-card)] z-10 border-b border-[var(--color-border)] flex flex-row items-center justify-between space-y-0 pb-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">Edit Coupon</h2>
              <button
                type="button"
                className="rounded-lg p-1 hover:bg-[var(--color-muted)]/50 transition-colors"
                onClick={() => setEditingId(null)}
              >
                <X className="h-5 w-5 text-[var(--color-muted-foreground)]" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 pb-6">
              {coupons.filter((c) => c.id === editingId).map((coupon) => (
                <form
                  key={coupon.id}
                  action={async (fd: FormData) => {
                    await updateCoupon(coupon.id, fd);
                    setEditingId(null);
                  }}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Code</Label>
                    <Input name="code" defaultValue={coupon.code} required className="mt-1 text-sm font-mono tracking-widest uppercase" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Type</Label>
                    <select
                      name="type"
                      defaultValue={coupon.type}
                      className="mt-1 h-9 flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                    >
                      <option value="percent">Percentage Off</option>
                      <option value="amount">Fixed Amount Off</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Value</Label>
                    <Input name="value" type="number" min={0} defaultValue={coupon.value} required className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Min Order (₹)</Label>
                    <Input name="min_order" type="number" min={0} defaultValue={coupon.min_order} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Max Uses</Label>
                    <Input name="max_uses" type="number" min={1} defaultValue={coupon.max_uses ?? ""} className="mt-1 text-sm" placeholder="Unlimited" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Start Date</Label>
                    <Input name="starts_at" type="datetime-local" defaultValue={coupon.starts_at ? coupon.starts_at.slice(0, 16) : ""} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">End Date</Label>
                    <Input name="ends_at" type="datetime-local" defaultValue={coupon.ends_at ? coupon.ends_at.slice(0, 16) : ""} className="mt-1 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Package IDs (comma-separated)</Label>
                    <Input name="package_ids" defaultValue={(coupon.package_ids || []).join(", ")} className="mt-1 text-sm" placeholder="Apply to all if empty" />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer sm:col-span-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      value="true"
                      defaultChecked={coupon.is_active}
                      className="accent-[var(--color-accent)] cursor-pointer"
                    />
                    <span className="font-medium">Active</span>
                  </label>
                  <div className="flex gap-2 sm:col-span-2 pt-2">
                    <Button type="submit" variant="accent" size="sm" className="flex-1 border-0">
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add New Modal */}
      {addingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-[var(--color-card)] z-10 border-b border-[var(--color-border)] flex flex-row items-center justify-between space-y-0 pb-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">New Coupon</h2>
              <button
                type="button"
                className="rounded-lg p-1 hover:bg-[var(--color-muted)]/50 transition-colors"
                onClick={() => setAddingNew(false)}
              >
                <X className="h-5 w-5 text-[var(--color-muted-foreground)]" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <form
                action={async (fd: FormData) => {
                  await createCoupon(fd);
                  setAddingNew(false);
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div className="sm:col-span-2">
                  <Label className="text-xs font-medium">Code *</Label>
                  <Input name="code" required className="mt-1 text-sm uppercase font-mono tracking-widest" placeholder="e.g. SUMMER20" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Type</Label>
                  <select
                    name="type"
                    className="mt-1 h-9 flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                  >
                    <option value="percent">Percentage Off</option>
                    <option value="amount">Fixed Amount Off</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Value (%, ₹) *</Label>
                  <Input name="value" type="number" min={0} required className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Min Order (₹)</Label>
                  <Input name="min_order" type="number" min={0} defaultValue={0} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Max Uses</Label>
                  <Input name="max_uses" type="number" min={1} className="mt-1 text-sm" placeholder="Unlimited" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Start Date</Label>
                  <Input name="starts_at" type="datetime-local" className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">End Date</Label>
                  <Input name="ends_at" type="datetime-local" className="mt-1 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs font-medium">Package IDs (comma-separated)</Label>
                  <Input name="package_ids" className="mt-1 text-sm" placeholder="Apply to all if empty" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer sm:col-span-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked
                    className="accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span className="font-medium">Active</span>
                </label>
                <div className="flex gap-2 sm:col-span-2 pt-2">
                  <Button type="submit" variant="accent" size="sm" className="flex-1">
                    Create Coupon
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setAddingNew(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Delete Coupon"
        description={`Are you sure you want to delete coupon "${itemToDelete?.code}"?`}
        onConfirm={() => {
          if (itemToDelete) {
            startTransition(async () => {
              await deleteCoupon(itemToDelete.id);
            });
          }
        }}
      />
    </div>
  );
}
