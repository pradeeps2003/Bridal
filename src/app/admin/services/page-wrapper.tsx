"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createService, deleteService, updateService } from "@/app/admin/actions";
import { useAdminNotification } from "@/components/ui/admin-notification";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import type { Service } from "@/types";

interface Props {
  services: Service[];
}

export function ServicesPageWrapper({ services }: Props) {
  const router = useRouter();
  const { showNotification, NotificationComponent } = useAdminNotification();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      {NotificationComponent}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <Card
          key={service.id}
          className="flex flex-col hover:border-[var(--color-accent)]/50 transition-colors"
        >
          <CardHeader className="flex-1">
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-foreground)]">
              {service.name}
            </h3>
            {service.description && (
              <p className="text-xs text-[var(--color-muted-foreground)] mt-2 line-clamp-2">
                {service.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-muted-foreground)]">Order: {service.display_order}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  service.is_active
                    ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "bg-[var(--color-muted)]/30 text-[var(--color-muted-foreground)]"
                }`}
              >
                {service.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[var(--color-accent)] border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10"
                onClick={() => setEditingId(service.id)}
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setItemToDelete({ id: service.id, name: service.name })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Service Card */}
      <button
        onClick={() => setAddingNew(true)}
        className="cursor-pointer min-h-48 rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-colors flex items-center justify-center"
      >
        <div className="text-center">
          <Plus className="h-8 w-8 mx-auto text-[var(--color-accent)] mb-2" />
          <p className="text-sm font-medium text-[var(--color-foreground)]">Add Service</p>
        </div>
      </button>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] flex flex-row items-center justify-between space-y-0 pb-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">Edit Service</h2>
              <button
                type="button"
                className="rounded-lg p-1 hover:bg-[var(--color-muted)]/50 transition-colors"
                onClick={() => setEditingId(null)}
              >
                <X className="h-5 w-5 text-[var(--color-muted-foreground)]" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 pb-6">
              {services.filter((s) => s.id === editingId).map((service) => (
                <form
                  key={service.id}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    showNotification("loading", "Saving changes...");
                    startTransition(async () => {
                      try {
                        await updateService(service.id, formData);
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
                    <Label className="text-xs font-medium">Name</Label>
                    <Input name="name" defaultValue={service.name} required className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Description</Label>
                    <Textarea
                      name="description"
                      defaultValue={service.description ?? ""}
                      className="mt-1 text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Display Order</Label>
                    <Input
                      name="display_order"
                      type="number"
                      defaultValue={service.display_order}
                      className="mt-1 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      value="true"
                      defaultChecked={service.is_active}
                      className="accent-[var(--color-accent)] cursor-pointer"
                    />
                    <span className="font-medium">Active</span>
                  </label>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" variant="accent" size="sm" className="flex-1" loading={isPending}>
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
          <Card className="w-full max-w-md">
            <CardHeader className="border-b border-[var(--color-border)] flex flex-row items-center justify-between space-y-0 pb-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">New Service</h2>
              <button
                type="button"
                className="rounded-lg p-1 hover:bg-[var(--color-muted)]/50 transition-colors"
                onClick={() => setAddingNew(false)}
              >
                <X className="h-5 w-5 text-[var(--color-muted-foreground)]" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  showNotification("loading", "Creating service...");
                  startTransition(async () => {
                    try {
                      await createService(formData);
                      showNotification("success", "Service created successfully!");
                      router.refresh();
                      setAddingNew(false);
                    } catch (error) {
                      showNotification("error", error instanceof Error ? error.message : "Failed to create service");
                    }
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-xs font-medium">Name *</Label>
                  <Input name="name" required className="mt-1 text-sm" placeholder="e.g., Bridal Makeup" />
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
                <div className="flex gap-2">
                  <Button type="submit" variant="accent" size="sm" className="flex-1" loading={isPending}>
                    Create Service
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
        title="Delete Service"
        description={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        onConfirm={() => {
          if (itemToDelete) {
            showNotification("loading", "Deleting service...");
            startTransition(async () => {
              try {
                await deleteService(itemToDelete.id);
                showNotification("success", "Service deleted successfully!");
                router.refresh();
                setItemToDelete(null);
              } catch (error) {
                showNotification("error", error instanceof Error ? error.message : "Failed to delete service");
              }
            });
          }
        }}
      />
    </div>
    </>
  );
}
