import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAllPortfolioItems } from "@/lib/data/portfolio";
import { PortfolioPageWrapper } from "./page-wrapper";

export default async function AdminPortfolioPage() {
  const items = await getAllPortfolioItems();

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">Portfolio</h1>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Manage gallery images shown on the public portfolio page.
          </p>
        </div>

        <PortfolioPageWrapper items={items} />

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-muted-foreground)] mb-4">No portfolio images uploaded yet.</p>
          </div>
        )}

        <Link href="/admin" className="text-sm text-[var(--color-accent)] hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </AdminShell>
  );
}
