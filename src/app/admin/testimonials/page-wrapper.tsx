"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonialAction,
  toggleTestimonialPublishAction,
} from "@/app/admin/actions";
import { useAdminNotification } from "@/components/ui/admin-notification";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { Edit2, Plus, Trash2, X, Star } from "lucide-react";
import type { Testimonial } from "@/types";

interface Props {
  testimonials: Testimonial[];
}

export function TestimonialsPageWrapper({ testimonials }: Props) {
  const router = useRouter();
  const { showNotification, NotificationComponent } = useAdminNotification();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const editingItem = testimonials.find((t) => t.id === editingId);

  return (
    <>
      {NotificationComponent}
      <div className="space-y-4">
      {/* Add new button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setAddingNew(true)}
          variant="accent"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-16">
            <Star className="h-10 w-10 mx-auto mb-4 text-[var(--color-accent)]/40" />
            <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
              No testimonials yet. Add one manually or wait for customer reviews.
            </p>
            <Button onClick={() => setAddingNew(true)} variant="accent" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add First Testimonial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="flex flex-col hover:border-[var(--color-accent)]/50 transition-colors"
            >
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold truncate">
                      {testimonial.full_name}
                    </h3>
                    {testimonial.event_type && (
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                        {testimonial.event_type}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (testimonial.rating || 5)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                        testimonial.is_published
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {testimonial.is_published ? "Published" : "Pending"}
                    </span>
                  </div>
                </div>
                <blockquote className="text-sm leading-relaxed text-[var(--color-muted-foreground)] mt-3 line-clamp-3 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex gap-2">
                  {/* Publish/Unpublish */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      showNotification("loading", "Updating status...");
                      startTransition(async () => {
                        try {
                          await toggleTestimonialPublishAction(testimonial.id, !testimonial.is_published);
                          showNotification("success", "Status updated successfully!");
                          router.refresh();
                        } catch (error) {
                          showNotification("error", error instanceof Error ? error.message : "Failed to update status");
                        }
                      });
                    }}
                  >
                    {testimonial.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  {/* Edit */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[var(--color-accent)] border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10"
                    onClick={() => setEditingId(testimonial.id)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  {/* Delete */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setItemToDelete({ id: testimonial.id, name: testimonial.full_name })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] flex flex-row items-center justify-between space-y-0 pb-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">
                Edit Testimonial
              </h2>
              <button
                type="button"
                className="rounded-lg p-1 hover:bg-[var(--color-muted)]/50 transition-colors"
                onClick={() => setEditingId(null)}
              >
                <X className="h-5 w-5 text-[var(--color-muted-foreground)]" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 pb-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  showNotification("loading", "Saving changes...");
                  startTransition(async () => {
                    try {
                      await updateTestimonial(editingId, formData);
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
                  <Label className="text-xs font-medium">Name *</Label>
                  <Input
                    name="full_name"
                    defaultValue={editingItem.full_name}
                    required
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Event Type</Label>
                  <Input
                    name="event_type"
                    defaultValue={editingItem.event_type ?? ""}
                    className="mt-1 text-sm"
                    placeholder="e.g., Bridal Makeup"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Rating *</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <label key={star} className="cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          value={star}
                          required
                          defaultChecked={star === (editingItem.rating || 5)}
                          className="sr-only peer"
                        />
                        <Star
                          className="w-6 h-6 text-gray-300 peer-checked:text-yellow-400 peer-hover:text-yellow-300 transition-colors"
                          fill="currentColor"
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Review / Quote *</Label>
                  <Textarea
                    name="quote"
                    defaultValue={editingItem.quote}
                    required
                    className="mt-1 text-sm"
                    rows={4}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_published"
                    value="true"
                    defaultChecked={editingItem.is_published}
                    className="accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span className="font-medium">Publish immediately</span>
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add New Modal */}
      {addingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] flex flex-row items-center justify-between space-y-0 pb-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">
                Add Testimonial
              </h2>
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
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  showNotification("loading", "Creating testimonial...");
                  startTransition(async () => {
                    try {
                      await createTestimonial(formData);
                      showNotification("success", "Testimonial created successfully!");
                      router.refresh();
                      setAddingNew(false);
                    } catch (error) {
                      showNotification("error", error instanceof Error ? error.message : "Failed to create testimonial");
                    }
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-xs font-medium">Customer Name *</Label>
                  <Input
                    name="full_name"
                    required
                    className="mt-1 text-sm"
                    placeholder="e.g., Priya Sharma"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Event Type</Label>
                  <Input
                    name="event_type"
                    className="mt-1 text-sm"
                    placeholder="e.g., Bridal Makeup, Reception"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Rating *</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <label key={star} className="cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          value={star}
                          required
                          defaultChecked={star === 5}
                          className="sr-only peer"
                        />
                        <Star
                          className="w-6 h-6 text-gray-300 peer-checked:text-yellow-400 peer-hover:text-yellow-300 transition-colors"
                          fill="currentColor"
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Review / Quote *</Label>
                  <Textarea
                    name="quote"
                    required
                    className="mt-1 text-sm"
                    rows={4}
                    placeholder="What the customer said about the service..."
                  />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_published"
                    value="true"
                    defaultChecked
                    className="accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span className="font-medium">Publish immediately</span>
                </label>
                <div className="flex gap-2">
                  <Button type="submit" variant="accent" size="sm" className="flex-1" loading={isPending}>
                    Add Testimonial
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingNew(false)}
                  >
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
        title="Delete Testimonial"
        description={`Are you sure you want to delete review from "${itemToDelete?.name}"?`}
        onConfirm={() => {
          if (itemToDelete) {
            showNotification("loading", "Deleting testimonial...");
            startTransition(async () => {
              try {
                await deleteTestimonialAction(itemToDelete.id);
                showNotification("success", "Testimonial deleted successfully!");
                router.refresh();
                setItemToDelete(null);
              } catch (error) {
                showNotification("error", error instanceof Error ? error.message : "Failed to delete testimonial");
              }
            });
          }
        }}
      />
    </div>
    </>
  );
}
