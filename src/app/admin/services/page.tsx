import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAllServices } from "@/lib/data/services";
import { ServicesPageWrapper } from "./page-wrapper";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await getAllServices();

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">Services</h1>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Manage service categories shown on the public site
          </p>
        </div>

        {/* Services Grid — client wrapper for modals */}
        <ServicesPageWrapper services={services} />

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-muted-foreground)] mb-4">No services yet. Create your first one!</p>
          </div>
        )}

        <Link href="/admin" className="text-sm text-[var(--color-accent)] hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </AdminShell>
  );
}
