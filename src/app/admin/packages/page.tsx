import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { getActivePackages } from "@/lib/data/packages";
import { getAllServices } from "@/lib/data/services";
import { createClient } from "@/lib/supabase/server";
import { PackagesPageWrapper } from "./page-wrapper";

async function getAllPackagesWithInclusions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("packages")
    .select("*, package_items(label, display_order)")
    .order("display_order");

  return (data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
    inclusions: (row.package_items as { label: string; display_order: number }[])
      ?.sort((a, b) => a.display_order - b.display_order)
      .map((i) => i.label)
      .join("\n") ?? "",
  }));
}

export default async function AdminPackagesPage() {
  const [services, packages] = await Promise.all([
    getAllServices(),
    getAllPackagesWithInclusions().catch(async () => {
      const pkgs = await getActivePackages();
      return pkgs.map((p) => ({
        ...p,
        inclusions: p.inclusions?.join("\n") ?? "",
      }));
    }),
  ]);

  return (
    <AdminShell>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl font-bold">Packages</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            Manage pricing packages and inclusions.
          </p>
        </div>

        <PackagesPageWrapper packages={packages} services={services} />

        {packages.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-[var(--color-muted-foreground)] mb-4 text-xs sm:text-sm">No packages created yet.</p>
          </div>
        )}

        <Link href="/admin" className="text-xs sm:text-sm text-[var(--color-accent)] hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </AdminShell>
  );
}
