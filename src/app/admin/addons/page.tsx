import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAllAddons } from "@/lib/data/addons";
import { AddonsPageWrapper } from "./page-wrapper";

export default async function AdminAddonsPage() {
  const addons = await getAllAddons();

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">Add-ons</h1>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Optional extras customers can select during booking.
          </p>
        </div>

        <AddonsPageWrapper addons={addons} />

        {addons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-muted-foreground)] mb-4">No add-ons created yet.</p>
          </div>
        )}

        <Link href="/admin" className="text-sm text-[var(--color-accent)] hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </AdminShell>
  );
}
