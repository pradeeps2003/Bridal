import type { AdminPermission } from "@/lib/notifications/types";
import type { AdminRole } from "@/types";

export const ADMIN_PERMISSION_LEVELS: Record<AdminPermission, { owner: string; staff: string }> = {
  "dashboard.view": { owner: "Full access", staff: "View" },
  "bookings.manage": { owner: "Full access", staff: "Manage" },
  "enquiries.manage": { owner: "Full access", staff: "Manage" },
  "calendar.manage": { owner: "Full access", staff: "View" },
  "catalogue.manage": { owner: "Full access", staff: "View" },
  "coupons.manage": { owner: "Full access", staff: "No access" },
  "content.manage": { owner: "Full access", staff: "View" },
  "settings.manage": { owner: "Full access", staff: "No access" },
  "team.manage": { owner: "Full access", staff: "No access" },
};

export function canAdmin(role: AdminRole, permission: AdminPermission) {
  return ADMIN_PERMISSION_LEVELS[permission][role] !== "No access";
}

export function isOwner(role: AdminRole) {
  return role === "owner";
}
