import { AdminShell } from "@/components/admin/admin-shell";
import { AboutPageWrapper } from "./page-wrapper";
import { getAboutSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

export default async function AdminAboutPage() {
  const about = await getAboutSettings();

  return (
    <AdminShell>
      <AboutPageWrapper about={about} />
    </AdminShell>
  );
}
