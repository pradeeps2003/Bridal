import { AdminShell } from "@/components/admin/admin-shell";
import { getSiteSettings } from "@/lib/data/settings";

import { BrandImagesPageWrapper } from "./page-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

export default async function AdminImagesPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell>
      <BrandImagesPageWrapper initialSettings={settings} />
    </AdminShell>
  );
}
