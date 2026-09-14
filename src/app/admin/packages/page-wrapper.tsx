"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createPackage, deletePackage, updatePackage } from "@/app/admin/actions";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminNotification } from "@/components/ui/admin-notification";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types";
import { Edit2, Plus, Trash2, X } from "lucide-react";

interface PackageBase {
  id: string;
  service_id: string;
  name: string;
  description?: string | null;
  price: number;
  pricing_type: string;
  duration_hours: number;
  display_order: number;
  is_active: boolean;
  image_url?: string | null;
  package_type?: string | null;
  sale_type?: string | null;
  sale_value?: number | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  inclusions?: string | null;
}

interface Props {
  packages: PackageBase[];
  services: Service[];
}

export function PackagesPageWrapper({ packages, services }: Props) {
  const router = useRouter();
  const { showNotification, NotificationComponent } = useAdminNotification();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      {NotificationComponent}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => {
        const serviceName = services.find((service) => service.id === pkg.service_id)?.name;

        return (
          <Card
            key={pkg.id}
            className="flex flex-col transition-colors hover:border-[var(--color-accent)]/50"
          >
            <CardHeader className="flex-1 space-y-3">
              {pkg.image_url ? (
                <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkg.image_url} alt="" className="aspect-[3/2] w-full object-cover" />
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-[var(--color-border)] px-3 py-6 text-center text-xs text-[var(--color-muted-foreground)]">
                  No image uploaded yet
                </p>
              )}
              <div className="flex items-start justify-between gap-2">
                <h3 className="pr-2 font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-foreground)]">
                  {pkg.name}
                </h3>
                <span className="whitespace-nowrap text-sm font-semibold text-[var(--color-accent)]">
                  {pkg.pricing_type === "CUSTOM_QUOTE" ? "Quote" : formatCurrency(pkg.price)}
                </span>
              </div>
              {pkg.description && (
                <p className="mt-2 line-clamp-2 text-xs text-[var(--color-muted-foreground)]">
                  {pkg.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="min-w-0 truncate text-[var(--color-muted-foreground)]">
                  {serviceName || "Unknown Service"}
                </span>
                <span
                  className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${
                    pkg.is_active
                      ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                      : "bg-[var(--color-muted)]/30 text-[var(--color-muted-foreground)]"
                  }`}
                >
                  {pkg.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
                  onClick={() => setEditingId(pkg.id)}
                >
                  <Edit2 className="mr-1 h-3 w-3" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`Delete ${pkg.name}`}
                  disabled={isPending}
                  className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setItemToDelete({ id: pkg.id, name: pkg.name })}
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <button
        type="button"
        aria-label="Add new package"
        onClick={() => setAddingNew(true)}
        className="flex min-h-48 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
      >
        <div className="text-center">
          <Plus className="mx-auto mb-2 h-8 w-8 text-[var(--color-accent)]" aria-hidden="true" />
          <p className="text-sm font-medium text-[var(--color-foreground)]">Add Package</p>
        </div>
      </button>

      {editingId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-package-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto">
            <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between space-y-0 border-b border-[var(--color-border)] bg-[var(--color-card)] pb-3">
              <h2 id="edit-package-title" className="font-[family-name:var(--font-heading)] text-lg font-semibold">
                Edit Package
              </h2>
              <button
                type="button"
                aria-label="Close edit package dialog"
                className="rounded-lg p-1 transition-colors hover:bg-[var(--color-muted)]/50"
                onClick={() => setEditingId(null)}
              >
                <X className="h-5 w-5 text-[var(--color-muted-foreground)]" aria-hidden="true" />
              </button>
            </CardHeader>

            <CardContent className="space-y-4 pb-6 pt-6">
              {packages
                .filter((pkg) => pkg.id === editingId)
                .map((pkg) => (
                  <form
                    key={pkg.id}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      showNotification("loading", "Saving changes...");
                      startTransition(async () => {
                        try {
                          await updatePackage(pkg.id, formData);
                          showNotification("success", "Changes saved successfully!");
                          router.refresh();
                          setEditingId(null);
                        } catch (error) {
                          showNotification("error", error instanceof Error ? error.message : "Failed to save changes");
                        }
                      });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor={`edit-package-service-${pkg.id}`} className="text-xs font-medium">
                        Service
                      </Label>
                      <select
                        id={`edit-package-service-${pkg.id}`}
                        name="service_id"
                        defaultValue={pkg.service_id}
                        className="mt-1 flex h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                      >
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`edit-package-name-${pkg.id}`} className="text-xs font-medium">
                        Name
                      </Label>
                      <Input
                        id={`edit-package-name-${pkg.id}`}
                        name="name"
                        defaultValue={pkg.name}
                        required
                        className="mt-1 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`edit-package-price-${pkg.id}`} className="text-xs font-medium">
                        Price (₹)
                      </Label>
                      <Input
                        id={`edit-package-price-${pkg.id}`}
                        name="price"
                        type="number"
                        defaultValue={pkg.price}
                        min={0}
                        required
                        className="mt-1 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`edit-package-pricing-${pkg.id}`} className="text-xs font-medium">
                        Pricing Type
                      </Label>
                      <select
                        id={`edit-package-pricing-${pkg.id}`}
                        name="pricing_type"
                        defaultValue={pkg.pricing_type}
                        className="mt-1 flex h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                      >
                        <option value="FIXED">Fixed</option>
                        <option value="STARTING_FROM">Starting From</option>
                        <option value="CUSTOM_QUOTE">Custom Quote</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`edit-package-duration-${pkg.id}`} className="text-xs font-medium">
                        Duration (hours)
                      </Label>
                      <Input
                        id={`edit-package-duration-${pkg.id}`}
                        name="duration_hours"
                        type="number"
                        step="0.5"
                        defaultValue={pkg.duration_hours}
                        className="mt-1 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`edit-package-description-${pkg.id}`} className="text-xs font-medium">
                        Description
                      </Label>
                      <Textarea
                        id={`edit-package-description-${pkg.id}`}
                        name="description"
                        defaultValue={pkg.description ?? ""}
                        className="mt-1 text-sm"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`edit-package-inclusions-${pkg.id}`} className="text-xs font-medium">
                        Inclusions (one per line)
                      </Label>
                      <Textarea
                        id={`edit-package-inclusions-${pkg.id}`}
                        name="inclusions"
                        defaultValue={pkg.inclusions ?? ""}
                        className="mt-1 text-sm"
                        rows={3}
                      />
                    </div>

                    <ImageUploadField
                      id={`edit-package-image-${pkg.id}`}
                      currentUrl={pkg.image_url}
                      label="Package image"
                    />

                    <div>
                      <Label htmlFor={`edit-package-order-${pkg.id}`} className="text-xs font-medium">
                        Display Order
                      </Label>
                      <Input
                        id={`edit-package-order-${pkg.id}`}
                        name="display_order"
                        type="number"
                        defaultValue={pkg.display_order}
                        className="mt-1 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`edit-package-type-${pkg.id}`} className="text-xs font-medium">
                        Package Type
                      </Label>
                      <select
                        id={`edit-package-type-${pkg.id}`}
                        name="package_type"
                        defaultValue={pkg.package_type ?? "standard"}
                        className="mt-1 flex h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                      >
                        <option value="standard">Standard</option>
                        <option value="popular">Popular</option>
                        <option value="most_ordered">Most Ordered</option>
                        <option value="premium">Premium</option>
                        <option value="new_arrival">New Arrival</option>
                        <option value="limited">Limited</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`edit-package-sale-type-${pkg.id}`} className="text-xs font-medium">
                        Sale Type
                      </Label>
                      <select
                        id={`edit-package-sale-type-${pkg.id}`}
                        name="sale_type"
                        defaultValue={pkg.sale_type ?? "none"}
                        className="mt-1 flex h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                      >
                        <option value="none">No Sale</option>
                        <option value="percent">Percentage Off</option>
                        <option value="amount">Fixed Amount Off</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`edit-package-sale-value-${pkg.id}`} className="text-xs font-medium">
                        Sale Value
                      </Label>
                      <Input
                        id={`edit-package-sale-value-${pkg.id}`}
                        name="sale_value"
                        type="number"
                        min={0}
                        defaultValue={pkg.sale_value ?? 0}
                        className="mt-1 text-sm"
                      />
                    </div>

                    <label
                      htmlFor={`edit-package-active-${pkg.id}`}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-border)] p-3 text-sm"
                    >
                      <input
                        id={`edit-package-active-${pkg.id}`}
                        type="checkbox"
                        name="is_active"
                        value="true"
                        defaultChecked={pkg.is_active}
                        className="cursor-pointer accent-[var(--color-accent)]"
                      />
                      <span className="font-medium">Active (Visible on public site)</span>
                    </label>

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" variant="accent" size="sm" className="flex-1" loading={isPending}>
                        Save Changes
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ))}
            </CardContent>
          </Card>
        </div>
      )}

      {addingNew && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-package-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto">
            <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between space-y-0 border-b border-[var(--color-border)] bg-[var(--color-card)] pb-3">
              <h2 id="new-package-title" className="font-[family-name:var(--font-heading)] text-lg font-semibold">
                New Package
              </h2>
              <button
                type="button"
                aria-label="Close new package dialog"
                className="rounded-lg p-1 transition-colors hover:bg-[var(--color-muted)]/50"
                onClick={() => setAddingNew(false)}
              >
                <X className="h-5 w-5 text-[var(--color-muted-foreground)]" aria-hidden="true" />
              </button>
            </CardHeader>

            <CardContent className="pb-6 pt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  showNotification("loading", "Creating package...");
                  startTransition(async () => {
                    try {
                      await createPackage(formData);
                      showNotification("success", "Package created successfully!");
                      router.refresh();
                      setAddingNew(false);
                    } catch (error) {
                      showNotification("error", error instanceof Error ? error.message : "Failed to create package");
                    }
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="new-package-service" className="text-xs font-medium">
                    Service
                  </Label>
                  <select
                    id="new-package-service"
                    name="service_id"
                    required
                    className="mt-1 flex h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                  >
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="new-package-name" className="text-xs font-medium">
                    Name *
                  </Label>
                  <Input id="new-package-name" name="name" required className="mt-1 text-sm" />
                </div>

                <div>
                  <Label htmlFor="new-package-price" className="text-xs font-medium">
                    Price (₹) *
                  </Label>
                  <Input id="new-package-price" name="price" type="number" min={0} required className="mt-1 text-sm" />
                </div>

                <div>
                  <Label htmlFor="new-package-pricing" className="text-xs font-medium">
                    Pricing Type
                  </Label>
                  <select
                    id="new-package-pricing"
                    name="pricing_type"
                    defaultValue="FIXED"
                    className="mt-1 flex h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                  >
                    <option value="FIXED">Fixed</option>
                    <option value="STARTING_FROM">Starting From</option>
                    <option value="CUSTOM_QUOTE">Custom Quote</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="new-package-duration" className="text-xs font-medium">
                    Duration (hours)
                  </Label>
                  <Input id="new-package-duration" name="duration_hours" type="number" step="0.5" defaultValue={3} className="mt-1 text-sm" />
                </div>

                <div>
                  <Label htmlFor="new-package-description" className="text-xs font-medium">
                    Description
                  </Label>
                  <Textarea id="new-package-description" name="description" className="mt-1 text-sm" rows={3} />
                </div>

                <div>
                  <Label htmlFor="new-package-inclusions" className="text-xs font-medium">
                    Inclusions (one per line)
                  </Label>
                  <Textarea
                    id="new-package-inclusions"
                    name="inclusions"
                    className="mt-1 text-sm"
                    rows={3}
                    placeholder="Minimal Makeup&#10;Basic Hairstyle"
                  />
                </div>

                <ImageUploadField id="new-package-image" label="Package image" />

                <div>
                  <Label htmlFor="new-package-order" className="text-xs font-medium">
                    Display Order
                  </Label>
                  <Input id="new-package-order" name="display_order" type="number" defaultValue={0} className="mt-1 text-sm" />
                </div>

                <div>
                  <Label htmlFor="new-package-type" className="text-xs font-medium">
                    Package Type
                  </Label>
                  <select
                    id="new-package-type"
                    name="package_type"
                    defaultValue="standard"
                    className="mt-1 flex h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                  >
                    <option value="standard">Standard</option>
                    <option value="popular">Popular</option>
                    <option value="most_ordered">Most Ordered</option>
                    <option value="premium">Premium</option>
                    <option value="new_arrival">New Arrival</option>
                    <option value="limited">Limited</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="new-package-sale-type" className="text-xs font-medium">
                    Sale Type
                  </Label>
                  <select
                    id="new-package-sale-type"
                    name="sale_type"
                    defaultValue="none"
                    className="mt-1 flex h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                  >
                    <option value="none">No Sale</option>
                    <option value="percent">Percentage Off</option>
                    <option value="amount">Fixed Amount Off</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="new-package-sale-value" className="text-xs font-medium">
                    Sale Value
                  </Label>
                  <Input id="new-package-sale-value" name="sale_value" type="number" min={0} defaultValue={0} className="mt-1 text-sm" />
                </div>

                <label htmlFor="new-package-active" className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-border)] p-3 text-sm">
                  <input
                    id="new-package-active"
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked
                    className="cursor-pointer accent-[var(--color-accent)]"
                  />
                  <span className="font-medium">Active (Visible on public site)</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="accent" size="sm" className="flex-1" loading={isPending}>
                    Create Package
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
        title="Delete Package"
        description={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        onConfirm={() => {
          if (itemToDelete) {
            showNotification("loading", "Deleting package...");
            startTransition(async () => {
              try {
                await deletePackage(itemToDelete.id);
                showNotification("success", "Package deleted successfully!");
                router.refresh();
                setItemToDelete(null);
              } catch (error) {
                showNotification("error", error instanceof Error ? error.message : "Failed to delete package");
              }
            });
          }
        }}
      />
    </div>
    </>
  );
}
