import { AdminShell } from "@/components/admin/admin-shell";
import { EnquiriesPageWrapper } from "./page-wrapper";
import { getEnquiries } from "@/lib/data/bookings";

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <AdminShell>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl">Enquiries</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            Manage contact form submissions and customer inquiries
          </p>
        </div>

        <EnquiriesPageWrapper enquiries={enquiries} />
      </div>
    </AdminShell>
  );
}