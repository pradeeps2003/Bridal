import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { createAdminClient } from "@/lib/supabase/admin";
import { CouponsPageWrapper } from "./page-wrapper";

async function getAllCoupons() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function AdminCouponsPage() {
  const coupons = await getAllCoupons();

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">Coupons</h1>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Manage discount codes and promotional offers.
          </p>
        </div>

        <CouponsPageWrapper coupons={coupons} />

        {coupons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-muted-foreground)] mb-4">No coupons created yet.</p>
          </div>
        )}

        <Link href="/admin" className="text-sm text-[var(--color-accent)] hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </AdminShell>
  );
}