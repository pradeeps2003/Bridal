"use client";

import { useState, useTransition } from "react";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAddon, deleteAddon, updateAddon } from "@/app/admin/actions";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Addon } from "@/types";

interface Props {
  addons: Addon[];
}

export function AddonsPageWrapper({ addons }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {addons.map((addon) => (
        <Card
          key={addon.id}
          className="flex flex-col hover:border-[var(--color-accent)]/50 transition-colors"
        >
          <CardHeader className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-foreground)] pr-2">
                {addon.name}
              </h3>
              <span className="font-semibold text-sm whitespace-nowrap">
                {addon.pricing_type === "CUSTOM_QUOTE" ? "Quote" : formatCurrency(addon.price)}
              </span>
            </div>
            {addon.description && (
              <p className="text-xs text-[var(--color-muted-foreground)] mt-2 line-clamp-2">
                {addon.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-muted-foreground)]">Order: {addon.display_order}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  addon.is_active
                    ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "bg-[var(--color-muted)]/30 text-[var(--color-muted-foreground)]"
                }`}
              >
                {addon.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[var(--color-accent)] border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10"
                onClick={() => setEditingId(addon.id)}
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setItemToDelete({ id: addon.id, name: addon.name })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Add-on Card */}
      <button
        onClick={() => setAddingNew(true)}
        className="cursor-pointer min-h-48 rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-colors flex items-center justify-center"
      >
        <div className="text-center">
          <Plus className="h-8 w-8 mx-auto text-[var(--color-accent)] mb-2" />
          <p className="text-sm font-medium text-[var(--color-foreground)]">Add Add-on</p>
        </div>
      </button>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] flex flex-row items-center justify-between space-y-0 pb-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">Edit Add-on</h2>
              <button
                type="button"
                className="rounded-lg p-1 hover:bg-[var(--color-muted)]/50 transition-colors"
                onClick={() => setEditingId(null)}
              >
                <X className="h-5 w-5 text-[var(--color-muted-foreground)]" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 pb-6">
              {addons.filter((a) => a.id === editingId).map((addon) => (
                <form
                  key={addon.id}
                  action={async (fd: FormData) => {
                    await updateAddon(addon.id, fd);
                    setEditingId(null);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-xs font-medium">Name</Label>
                    <Input name="name" defaultValue={addon.name} required className="mt-1 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium">Price (₹)</Label>
                      <Input name="price" type="number" defaultValue={addon.price} min={0} required className="mt-1 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Pricing</Label>
                      <select name="pricing_type" defaultValue={addon.pricing_type ?? "FIXED"} className="mt-1 h-9 flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]">
                        <option value="FIXED">Fixed</option>
                        <option value="CUSTOM_QUOTE">Negotiable / quote</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Description</Label>
                    <Textarea
                      name="description"
                      defaultValue={addon.description ?? ""}
                      className="mt-1 text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Display Order</Label>
                    <Input
                      name="display_order"
                      type="number"
                      defaultValue={addon.display_order}
                      className="mt-1 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      value="true"
                      defaultChecked={addon.is_active}
                      className="accent-[var(--color-accent)] cursor-pointer"
                    />
                    <span className="font-medium">Active</span>
                  </label>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" variant="accent" size="sm" className="flex-1">
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
            <CardHeader className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] flex flex-row items-center justify-between space-y-0 pb-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">New Add-on</h2>
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
                  await createAddon(fd);
                  setAddingNew(false);
                }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-xs font-medium">Name *</Label>
                  <Input name="name" required className="mt-1 text-sm" placeholder="e.g., HD Makeup Addon" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium">Price (₹) *</Label>
                    <Input name="price" type="number" min={0} required className="mt-1 text-sm" placeholder="e.g. 500" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Pricing</Label>
                    <select name="pricing_type" defaultValue="FIXED" className="mt-1 h-9 flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]">
                      <option value="FIXED">Fixed</option>
                      <option value="CUSTOM_QUOTE">Negotiable / quote</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Description</Label>
                  <Textarea name="description" className="mt-1 text-sm" rows={3} placeholder="Service details..." />
                </div>
                <div>
                  <Label className="text-xs font-medium">Display Order</Label>
                  <Input name="display_order" type="number" defaultValue={0} className="mt-1 text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked
                    className="accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span className="font-medium">Active</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="accent" size="sm" className="flex-1">
                    Create Add-on
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
        title="Delete Add-on"
        description={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        onConfirm={() => {
          if (itemToDelete) {
            startTransition(async () => {
              await deleteAddon(itemToDelete.id);
            });
          }
        }}
      />
    </div>
  );
}
