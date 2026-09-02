"use client";

import {
  Calendar,
  Clock,
  Gift,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
  Star,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type AdminMenuIcon =
  | "dashboard"
  | "calendar"
  | "enquiries"
  | "clock"
  | "services"
  | "packages"
  | "addons"
  | "coupons"
  | "reviews"
  | "portfolio"
  | "settings";

export type AdminMenuItem = {
  href: string;
  label: string;
  icon: AdminMenuIcon;
  ownerOnly?: boolean;
  badge?: number;
};

export type AdminNavDensity = "rail" | "sheet";

type AdminNavProps = {
  items: readonly AdminMenuItem[];
  density: AdminNavDensity;
  onNavigate?: () => void;
  showIcons?: boolean;
};

const ICONS: Record<AdminMenuIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  calendar: Calendar,
  enquiries: MessageSquare,
  clock: Clock,
  services: Gift,
  packages: Users,
  addons: Plus,
  coupons: Tag,
  reviews: Star,
  portfolio: ImageIcon,
  settings: Settings,
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ items, density, onNavigate, showIcons = true }: AdminNavProps) {
  const pathname = usePathname();
  const isRail = density === "rail";

  return (
    <nav
      className={cn(
        "flex flex-col",
        isRail ? "flex-1 space-y-1 overflow-y-auto px-3 py-4" : "gap-1",
      )}
      aria-label="Admin navigation"
    >
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            data-admin-nav-link="true"
            className={cn(
              "group flex w-full items-center gap-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-card)",
              isRail
                ? "h-11 rounded-(--radius-md) px-3"
                : "min-h-[44px] rounded-lg px-3 py-3 flex items-center",
              active
                ? "bg-(--color-muted) font-semibold text-(--color-foreground)"
                : "text-(--color-muted-foreground) hover:bg-(--color-muted) hover:text-(--color-foreground)",
            )}
          >
            {showIcons && (
              <Icon
                className="h-[18px] w-[18px] shrink-0 text-current"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            )}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-(--color-accent) px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 w-1.5 shrink-0 rotate-45 bg-(--color-accent)",
                active ? "opacity-100" : "opacity-0",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
