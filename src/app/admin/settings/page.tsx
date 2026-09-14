import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsPageWrapper } from "./page-wrapper";
import { getAllSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <AdminShell>
      <SettingsPageWrapper initialSettings={settings} />
    </AdminShell>
  );
}
