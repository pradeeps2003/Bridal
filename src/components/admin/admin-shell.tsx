import { redirect } from "next/navigation";

import { AdminAccountFooter, type AdminIdentity } from "@/components/admin/admin-account-footer";
import { AdminRealtime } from "@/components/admin/admin-realtime";
import { AdminNav, type AdminMenuItem } from "@/components/admin/admin-nav";
import { MobileAdminMenu } from "@/components/admin/mobile-admin-menu";
import { getCurrentAdmin } from "@/lib/data/admin";
import { getUnreadEnquiryCount } from "@/lib/data/bookings";
import type { AdminRole } from "@/types";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const ADMIN_MENU: readonly AdminMenuItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/about", label: "About page", icon: "about", ownerOnly: true },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "enquiries" },
  { href: "/admin/calendar", label: "Calendar", icon: "clock" },
  { href: "/admin/services", label: "Services", icon: "services" },
  { href: "/admin/packages", label: "Packages", icon: "packages" },
  { href: "/admin/addons", label: "Add-ons", icon: "addons" },
  { href: "/admin/coupons", label: "Coupons", icon: "coupons" },
  { href: "/admin/testimonials", label: "Reviews", icon: "reviews" },
  { href: "/admin/portfolio", label: "Portfolio", icon: "portfolio" },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: "settings",
    ownerOnly: true,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

/** Shell wrapper used by protected admin pages */
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getCurrentAdmin();

  if (!session) {
    redirect("/admin/login");
  }

  const { admin } = session;
  const unreadEnquiries = await getUnreadEnquiryCount();
  const visibleMenu = ADMIN_MENU.filter(
    (item) => !item.ownerOnly || admin.role === "owner",
  ).map((item) =>
    item.href === "/admin/enquiries" && unreadEnquiries > 0
      ? { ...item, badge: unreadEnquiries }
      : item,
  );
  const adminIdentity: AdminIdentity = {
    full_name: admin.full_name,
    email: admin.email,
    role: admin.role as AdminRole,
  };

  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-(--color-background)">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-(--color-border) bg-(--color-card) lg:flex">
        <AdminNav items={visibleMenu} density="rail" />

        <div className="space-y-4 border-t border-(--color-border) p-4">
          <AdminAccountFooter admin={adminIdentity} />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <MobileAdminMenu
          items={visibleMenu}
          account={<AdminAccountFooter admin={adminIdentity} showIdentity={false} />}
        />

        <header className="hidden h-16 shrink-0 items-center border-b border-(--color-border) bg-(--color-card) px-4 sm:px-6 lg:flex">
          <BrandLogo href="/admin" className="h-12 max-h-12" label="Admin dashboard" />
          <span className="ml-3 text-[10px] uppercase tracking-[0.16em] text-(--color-muted-foreground)">
            Admin
          </span>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <AdminRealtime />
          </div>
        </header>

        <main
          data-admin-content
          className="min-h-0 flex-1 overflow-auto"
        >
          <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
