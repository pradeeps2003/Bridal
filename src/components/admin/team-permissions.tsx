"use client";

import { useState, useTransition } from "react";

import { updateAdminRoleAction } from "@/app/admin/actions";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_PERMISSION_LEVELS } from "@/lib/auth/permissions";
import type { TeamMember } from "@/lib/notifications/types";

const permissionLabels: Record<keyof typeof ADMIN_PERMISSION_LEVELS, string> = {
  "dashboard.view": "Dashboard",
  "bookings.manage": "Bookings",
  "enquiries.manage": "Enquiries",
  "calendar.manage": "Calendar",
  "catalogue.manage": "Services, packages, and add-ons",
  "coupons.manage": "Coupons",
  "content.manage": "Reviews and portfolio",
  "settings.manage": "Settings",
  "team.manage": "Team",
};

export function TeamPermissions({ members, canManage }: { members: TeamMember[]; canManage: boolean }) {
  const [selectedRole, setSelectedRole] = useState<"owner" | "staff">("owner");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  function submitRole(formData: FormData) {
    startTransition(async () => {
      try {
        await updateAdminRoleAction(formData);
        setFeedback({ title: "Team updated", message: "The admin role was updated successfully." });
      } catch (error) {
        setFeedback({ title: "Team update failed", message: error instanceof Error ? error.message : "The role could not be updated." });
      }
    });
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section aria-labelledby="team-members-heading">
          <h2 id="team-members-heading" className="font-[family-name:var(--font-heading)] text-2xl">Team members</h2>
          <div className="mt-3 space-y-3">
            {members.length === 0 ? <p className="text-sm text-[var(--color-muted-foreground)]">No active team members.</p> : members.map((member) => (
              <Card key={member.id}><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-sm font-medium">{member.fullName ?? member.email}</p><p className="mt-1 truncate text-xs text-[var(--color-muted-foreground)]">{member.email}</p></div><span className="text-xs capitalize text-[var(--color-muted-foreground)]">{member.role}</span></div>{canManage && <form action={submitRole} className="flex items-center gap-2 border-t border-[var(--color-border)] pt-3"><input type="hidden" name="admin_id" value={member.id} /><label htmlFor={`role-${member.id}`} className="sr-only">Role for {member.email}</label><select id={`role-${member.id}`} name="role" defaultValue={member.role} className="h-9 min-w-0 flex-1 rounded-sm border border-[var(--color-border)] bg-[var(--color-card)] px-2 text-xs"><option value="owner">Owner</option><option value="staff">Staff</option></select><Button type="submit" size="sm" variant="outline" disabled={pending}>Save</Button></form>}</CardContent></Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="permissions-heading">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id="permissions-heading" className="font-[family-name:var(--font-heading)] text-2xl">Team &amp; permissions</h2><p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Access is enforced on the server for every mutation.</p></div><div className="flex gap-3 lg:hidden" role="tablist" aria-label="Permission role"><button type="button" role="tab" aria-selected={selectedRole === "owner"} onClick={() => setSelectedRole("owner")} className={`border-b pb-1 text-xs ${selectedRole === "owner" ? "border-[var(--color-accent)]" : "border-transparent text-[var(--color-muted-foreground)]"}`}>Owner</button><button type="button" role="tab" aria-selected={selectedRole === "staff"} onClick={() => setSelectedRole("staff")} className={`border-b pb-1 text-xs ${selectedRole === "staff" ? "border-[var(--color-accent)]" : "border-transparent text-[var(--color-muted-foreground)]"}`}>Staff</button></div></div>
          <div className="mt-4 overflow-x-auto border border-[var(--color-border)] bg-[var(--color-card)]"><table className="w-full min-w-[520px] text-left text-xs"><caption className="sr-only">Permissions by admin role</caption><thead><tr className="border-b border-[var(--color-border)]"><th className="px-4 py-3 font-medium">Area</th><th className={`px-4 py-3 font-medium ${selectedRole === "staff" ? "hidden lg:table-cell" : ""}`}>Owner</th><th className={`px-4 py-3 font-medium ${selectedRole === "owner" ? "hidden lg:table-cell" : ""}`}>Staff</th></tr></thead><tbody>{Object.entries(ADMIN_PERMISSION_LEVELS).map(([key, levels]) => <tr key={key} className="border-b border-[var(--color-border)] last:border-b-0"><th className="px-4 py-3 font-medium">{permissionLabels[key as keyof typeof permissionLabels]}</th><td className={`px-4 py-3 ${selectedRole === "staff" ? "hidden lg:table-cell" : ""}`}>{levels.owner}</td><td className={`px-4 py-3 ${selectedRole === "owner" ? "hidden lg:table-cell" : ""}`}>{levels.staff}</td></tr>)}</tbody></table></div>
        </section>
      </div>
      <FeedbackDialog open={!!feedback} title={feedback?.title ?? ""} message={feedback?.message ?? ""} tone={feedback?.title === "Team updated" ? "success" : "error"} onClose={() => setFeedback(null)} />
    </>
  );
}
