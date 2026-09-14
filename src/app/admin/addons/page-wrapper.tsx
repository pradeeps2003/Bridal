"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createAddon, deleteAddon, updateAddon } from "@/app/admin/actions";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminNotification } from "@/components/ui/admin-notification";
import { formatCurrency } from "@/lib/utils";
import type { Addon } from "@/types";
import { Edit2, Plus, Trash2, X } from "lucide-react";

interface Props {
  addons: Addon[];
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not save the add-on. Please try again.";
}

export function AddonsPageWrapper({ addons }: Props) {
  const router = useRouter();
  const { showNotification, NotificationComponent } = useAdminNotification();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function closeForm() {
    setEditingId(null);
    setAddingNew(false);
    setFormError(null);
  }

  function submitForm(action: () => Promise<void>, onSuccess: () => void) {
    setFormError(null);
    showNotification("loading", "Saving changes...");
    startTransition(async () => {
      try {
        await action();
        showNotification("success", "Changes saved successfully!");
        router.refresh();
        onSuccess();
      } catch (error) {
        showNotification("error", errorMessage(error));
        setFormError(errorMessage(error));
      }
    });
  }

  return (
    <>
      {NotificationComponent}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {addons.map((addon) => (
        <Card key={addon.id} className="flex flex-col transition-colors hover:border-(--color-accent)/50">
          <CardHeader className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="pr-2 font-[family-name:var(--font-heading)] text-lg font-semibold text-(--color-foreground)">{addon.name}</h3>
              <span className="whitespace-nowrap text-sm font-semibold">
                {addon.pricing_type === "CUSTOM_QUOTE" ? "Quote" : formatCurrency(addon.price)}
              </span>
            </div>
            {addon.description && <p className="mt-2 line-clamp-2 text-xs text-(--color-muted-foreground)">{addon.description}</p>}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-(--color-muted-foreground)">Order: {addon.display_order}</span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${addon.is_active ? "bg-(--color-accent)/10 text-(--color-accent)" : "bg-(--color-muted)/30 text-(--color-muted-foreground)"}`}>
                {addon.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-(--color-accent)" onClick={() => { setFormError(null); setEditingId(addon.id); }}>
                <Edit2 className="mr-1 h-3 w-3" aria-hidden="true" /> Edit
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setItemToDelete({ id: addon.id, name: addon.name })}>
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <button type="button" onClick={() => { setFormError(null); setAddingNew(true); }} className="flex min-h-48 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-(--color-border) transition-colors hover:border-(--color-accent) hover:bg-(--color-accent)/5">
        <div className="text-center"><Plus className="mx-auto mb-2 h-8 w-8 text-(--color-accent)" aria-hidden="true" /><p className="text-sm font-medium text-(--color-foreground)">Add Add-on</p></div>
      </button>

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="edit-addon-title">
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto">
            <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between space-y-0 border-b border-(--color-border) bg-(--color-card) pb-3">
              <h2 id="edit-addon-title" className="font-[family-name:var(--font-heading)] text-lg font-semibold">Edit Add-on</h2>
              <button type="button" aria-label="Close edit add-on dialog" className="rounded-lg p-1 hover:bg-(--color-muted)/50" onClick={closeForm}><X className="h-5 w-5 text-(--color-muted-foreground)" aria-hidden="true" /></button>
            </CardHeader>
            <CardContent className="space-y-4 pb-6 pt-6">
              {addons.filter((addon) => addon.id === editingId).map((addon) => (
                <form key={addon.id} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); submitForm(() => updateAddon(addon.id, data), closeForm); }} className="space-y-4">
                  <AddonFields addon={addon} />
                  {formError && <p role="alert" className="rounded-md border border-(--color-destructive)/30 bg-(--color-destructive)/5 px-3 py-2 text-xs text-(--color-destructive)">{formError}</p>}
                  <div className="flex gap-2 pt-2"><Button type="submit" variant="accent" size="sm" className="flex-1" loading={isPending}>Save Changes</Button><Button type="button" variant="outline" size="sm" onClick={closeForm} disabled={isPending}>Cancel</Button></div>
                </form>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {addingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="new-addon-title">
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto">
            <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between space-y-0 border-b border-(--color-border) bg-(--color-card) pb-3">
              <h2 id="new-addon-title" className="font-[family-name:var(--font-heading)] text-lg font-semibold">New Add-on</h2>
              <button type="button" aria-label="Close new add-on dialog" className="rounded-lg p-1 hover:bg-(--color-muted)/50" onClick={closeForm}><X className="h-5 w-5 text-(--color-muted-foreground)" aria-hidden="true" /></button>
            </CardHeader>
            <CardContent className="pb-6 pt-6">
              <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); submitForm(() => createAddon(data), closeForm); }} className="space-y-4">
                <AddonFields />
                {formError && <p role="alert" className="rounded-md border border-(--color-destructive)/30 bg-(--color-destructive)/5 px-3 py-2 text-xs text-(--color-destructive)">{formError}</p>}
                <div className="flex gap-2 pt-2"><Button type="submit" variant="accent" size="sm" className="flex-1" loading={isPending}>Create Add-on</Button><Button type="button" variant="outline" size="sm" onClick={closeForm} disabled={isPending}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDeleteModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Delete Add-on" description={`Are you sure you want to delete "${itemToDelete?.name}"?`} onConfirm={() => { if (itemToDelete) { showNotification("loading", "Deleting add-on..."); startTransition(async () => { try { await deleteAddon(itemToDelete.id); showNotification("success", "Add-on deleted successfully!"); router.refresh(); setItemToDelete(null); } catch (error) { showNotification("error", errorMessage(error)); setFormError(errorMessage(error)); } }); } }} />
      {formError && !editingId && !addingNew && <p role="alert" className="sm:col-span-2 lg:col-span-3 text-xs text-(--color-destructive)">{formError}</p>}
    </div>
    </>
  );
}

function AddonFields({ addon }: { addon?: Addon }) {
  return (
    <>
      <div><Label htmlFor={addon ? `addon-name-${addon.id}` : "new-addon-name"}>Name</Label><Input id={addon ? `addon-name-${addon.id}` : "new-addon-name"} name="name" defaultValue={addon?.name} required className="mt-1" /></div>
      <div className="grid grid-cols-2 gap-4"><div><Label htmlFor={addon ? `addon-price-${addon.id}` : "new-addon-price"}>Price (₹)</Label><Input id={addon ? `addon-price-${addon.id}` : "new-addon-price"} name="price" type="number" min={0} defaultValue={addon?.price ?? 0} className="mt-1" /></div><div><Label htmlFor={addon ? `addon-pricing-${addon.id}` : "new-addon-pricing"}>Pricing</Label><select id={addon ? `addon-pricing-${addon.id}` : "new-addon-pricing"} name="pricing_type" defaultValue={addon?.pricing_type ?? "CUSTOM_QUOTE"} className="mt-1 flex h-11 w-full rounded-sm border border-(--color-border) bg-(--color-card) px-3 text-sm"><option value="CUSTOM_QUOTE">Negotiable / quote</option><option value="FIXED">Fixed</option><option value="STARTING_FROM">Starting from</option></select></div></div>
      <div><Label htmlFor={addon ? `addon-description-${addon.id}` : "new-addon-description"}>Description</Label><Textarea id={addon ? `addon-description-${addon.id}` : "new-addon-description"} name="description" defaultValue={addon?.description ?? ""} className="mt-1" rows={3} /></div>
      <div><Label htmlFor={addon ? `addon-order-${addon.id}` : "new-addon-order"}>Display Order</Label><Input id={addon ? `addon-order-${addon.id}` : "new-addon-order"} name="display_order" type="number" min={0} defaultValue={addon?.display_order ?? 0} className="mt-1" /></div>
      <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" name="is_active" value="true" defaultChecked={addon?.is_active ?? true} className="accent-(--color-accent)" /><span className="font-medium">Active</span></label>
    </>
  );
}
