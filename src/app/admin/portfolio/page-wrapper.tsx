"use client";

import { useState, useTransition } from "react";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPortfolioItem, deletePortfolioItem, updatePortfolioItem } from "@/app/admin/actions";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import { PORTFOLIO_CATEGORIES } from "@/types";
import type { PortfolioItem } from "@/types";

interface Props {
  items: PortfolioItem[];
}

export function PortfolioPageWrapper({ items }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.id}
          className="flex flex-col hover:border-[var(--color-accent)]/50 transition-colors overflow-hidden"
        >
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.title ?? ""} className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div className="aspect-[4/3] w-full bg-[var(--color-muted)] flex items-center justify-center text-xs text-[var(--color-muted-foreground)]">
              No Image
            </div>
          )}
          <CardContent className="pt-4 space-y-3 flex flex-col flex-1">
            <div className="flex-1">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-foreground)] line-clamp-1">
                {item.title || "Untitled"}
              </h3>
              <p className="text-xs font-semibold text-[var(--color-accent)] mt-1">{item.category}</p>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-muted-foreground)]">Order: {item.display_order}</span>
              <span
                className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
                  item.is_published
                    ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "bg-[var(--color-muted)]/30 text-[var(--color-muted-foreground)]"
                }`}
              >
                {item.is_published ? "Published" : "Draft"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[var(--color-accent)] border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10"
                onClick={() => setEditingId(item.id)}
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setItemToDelete({ id: item.id, title: item.title ?? "Untitled" })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Item Card */}
      <button
        onClick={() => setAddingNew(true)}
        className="cursor-pointer min-h-48 rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-colors flex items-center justify-center p-6"
      >
        <div className="text-center">
          <Plus className="h-8 w-8 mx-auto text-[var(--color-accent)] mb-2" />
          <p className="text-sm font-medium text-[var(--color-foreground)]">Add Image</p>
        </div>
      </button>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-[var(--color-card)] z-10 border-b border-[var(--color-border)] flex flex-row items-center justify-between space-y-0 pb-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">Edit Image</h2>
              <button
                type="button"
                className="rounded-lg p-1 hover:bg-[var(--color-muted)]/50 transition-colors"
                onClick={() => setEditingId(null)}
              >
                <X className="h-5 w-5 text-[var(--color-muted-foreground)]" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 pb-6">
              {items.filter((i) => i.id === editingId).map((item) => (
                <form
                  key={item.id}
                  action={async (fd: FormData) => {
                    await updatePortfolioItem(item.id, fd);
                    setEditingId(null);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-xs font-medium">Title</Label>
                    <Input name="title" defaultValue={item.title ?? ""} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Category</Label>
                    <select
                      name="category"
                      defaultValue={item.category}
                      className="mt-1 h-9 flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                    >
                      {PORTFOLIO_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Image URL</Label>
                    <Input name="image_url" defaultValue={item.image_url ?? ""} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Display Order</Label>
                    <Input name="display_order" type="number" defaultValue={item.display_order} className="mt-1 text-sm" />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_published"
                      value="true"
                      defaultChecked={item.is_published}
                      className="accent-[var(--color-accent)] cursor-pointer"
                    />
                    <span className="font-medium">Published</span>
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
            <CardHeader className="sticky top-0 bg-[var(--color-card)] z-10 border-b border-[var(--color-border)] flex flex-row items-center justify-between space-y-0 pb-3">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">New Image</h2>
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
                  await createPortfolioItem(fd);
                  setAddingNew(false);
                }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-xs font-medium">Title</Label>
                  <Input name="title" className="mt-1 text-sm" placeholder="e.g., Soft Glam Wedding" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Category</Label>
                  <select
                    name="category"
                    className="mt-1 h-9 flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                  >
                    {PORTFOLIO_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Image URL *</Label>
                  <Input name="image_url" type="url" required placeholder="https://..." className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Display Order</Label>
                  <Input name="display_order" type="number" defaultValue={0} className="mt-1 text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_published"
                    value="true"
                    defaultChecked
                    className="accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span className="font-medium">Published</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="accent" size="sm" className="flex-1">
                    Add Item
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
        title="Delete Portfolio Item"
        description={`Are you sure you want to delete "${itemToDelete?.title}"?`}
        onConfirm={() => {
          if (itemToDelete) {
            startTransition(async () => {
              await deletePortfolioItem(itemToDelete.id);
            });
          }
        }}
      />
    </div>
  );
}
