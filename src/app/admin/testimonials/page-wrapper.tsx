"use client";

import { useState } from "react";
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
import { Edit2, Plus, Trash2, X, Star } from "lucide-react";
import type { Testimonial } from "@/types";

interface Props {
  testimonials: Testimonial[];
}

export function TestimonialsPageWrapper({ testimonials }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  const editingItem = testimonials.find((t) => t.id === editingId);

  return (
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
                <blockquote className="text-sm leading-relaxed text-[var(--color-muted-foreground)] mt-3 line-clamp-3 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex gap-2">
                  {/* Publish/Unpublish */}
                  <form
                    action={toggleTestimonialPublishAction.bind(
                      null,
                      testimonial.id,
                      !testimonial.is_published,
                    )}
                    className="flex-1"
                  >
                    <Button type="submit" variant="outline" size="sm" className="w-full text-xs">
                      {testimonial.is_published ? "Unpublish" : "Publish"}
                    </Button>
                  </form>
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
                  <form action={deleteTestimonialAction.bind(null, testimonial.id)}>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        if (!confirm(`Delete review from "${testimonial.full_name}"?`))
                          e.preventDefault();
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </form>
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
                action={async (fd: FormData) => {
                  await updateTestimonial(editingId, fd);
                  setEditingId(null);
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
                action={async (fd: FormData) => {
                  await createTestimonial(fd);
                  setAddingNew(false);
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
                  <Button type="submit" variant="accent" size="sm" className="flex-1">
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
    </div>
  );
}
