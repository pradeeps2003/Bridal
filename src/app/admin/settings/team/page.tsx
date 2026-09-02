import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { TeamPermissions } from "@/components/admin/team-permissions";
import { getAdminTeam, getCurrentAdmin } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const [members, session] = await Promise.all([getAdminTeam(), getCurrentAdmin()]);
  const canManage = session?.admin.role === "owner";

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/admin/settings" className="text-xs text-[var(--color-accent)] hover:underline">← Settings</Link>
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-4xl">Team &amp; permissions</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted-foreground)]">Manage active admin roles and review exactly what each role can do.</p>
          </div>
          {!canManage && <p className="text-xs text-[var(--color-muted-foreground)]">You have read-only access to this view.</p>}
        </div>
        <TeamPermissions members={members} canManage={canManage} />
      </div>
    </AdminShell>
  );
}
