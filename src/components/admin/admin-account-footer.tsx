import Link from "next/link";
import { LogOut } from "lucide-react";

import { signOut } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminRole } from "@/types";

export type AdminIdentity = {
  full_name: string | null;
  email: string;
  role: AdminRole;
};

type AdminAccountFooterProps = {
  admin: AdminIdentity;
  className?: string;
  showIdentity?: boolean;
};

export function AdminAccountFooter({
  admin,
  className,
  showIdentity = true,
}: AdminAccountFooterProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {showIdentity && (
        <div className="rounded-(--radius-md) bg-(--color-muted)/60 px-3 py-3">
          <p className="text-xs font-medium text-(--color-accent)">Logged in as</p>
          <p className="mt-1 truncate text-sm font-semibold text-(--color-foreground)">
            {admin.full_name ?? admin.email}
          </p>
          <p className="mt-0.5 text-xs capitalize text-(--color-muted-foreground)">
            {admin.role}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="min-h-11 flex-1 px-3"
        >
          <Link href="/" aria-label="View public website">View Site</Link>
        </Button>
        <form action={signOut} className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="min-h-11 w-full px-3"
            aria-label="Logout from admin"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Logout</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
