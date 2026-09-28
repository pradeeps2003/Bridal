import Link from "next/link";
import {
  ChevronRight,
  ExternalLink,
  Instagram,
  MapPin,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { getSiteSettings } from "@/lib/data/settings";

const DEVELOPER = {
  name: "Pradeep",
  email: "gokulpradeep2003@gmail.com",
};

const footerLinks = {
  explore: [
    { href: "/packages", label: "Packages & Pricing" },
    { href: "/about", label: "About Artist" },
    { href: "/faq", label: "FAQ & Help" },
    { href: "/contact", label: "Contact Us" },
  ],
  connect: [
    { href: "/book", label: "Book Appointment" },
    { href: "/login", label: "Client Login" },
    { href: "/admin/login", label: "Studio Admin" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Settings" },
  ],
};

export async function SiteFooter({ compact = false }: { compact?: boolean }) {
  const settings = await getSiteSettings();
  const instagramUrl = settings.instagram
    ? settings.instagram.startsWith("http")
      ? settings.instagram
      : `https://instagram.com/${settings.instagram.replace(/^@/, "")}`
    : "https://instagram.com/glow_with_rubi";

  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-[hsl(345_40%_7%)] text-[hsl(30_25%_92%)]">

      <div className={`container-wide px-4 ${compact ? "py-6 sm:py-12" : "py-8 sm:py-12"} sm:px-6`}>
        


        {/* Brand Header */}
        <div className={`${compact ? "mb-6 sm:mb-10" : "mb-8 sm:mb-10"} flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end`}>
          <div>
            <BrandLogo className={compact ? "h-14 max-h-14 sm:h-20 sm:max-h-20" : "h-16 max-h-16 sm:h-24 sm:max-h-24"} />
            <p className="mt-3 max-w-lg text-xs leading-relaxed text-white/70 sm:text-sm">
              Premium bridal HD makeup from Pollachi. Home and venue service in Coimbatore, Tiruppur, Udumalpet, Valparai, and across Tamil Nadu — saree draping, jewellery setting, reception and engagement looks.
            </p>
            {/* Service Location Badge */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/80">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
              <span>Pollachi • Coimbatore • Tiruppur • All Tamil Nadu</span>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Link Grid (3 columns on desktop, touch-friendly 2-column list on mobile) */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 border-t border-white/10 pt-6 sm:pt-8">
          {/* Explore */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
              Explore
            </p>
            <ul className="space-y-2.5 sm:space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex min-h-[36px] sm:min-h-0 items-center gap-1 text-xs sm:text-sm text-white/75 transition-colors hover:text-[var(--color-accent)]"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100 sm:inline" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
              Connect
            </p>
            <ul className="space-y-2.5 sm:space-y-2">
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-[36px] sm:min-h-0 items-center gap-1.5 text-xs sm:text-sm text-white/75 transition-colors hover:text-[var(--color-accent)]"
                >
                  <Instagram className="h-3.5 w-3.5 text-pink-400" />
                  <span>Instagram</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </li>

              {footerLinks.connect.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex min-h-[36px] sm:min-h-0 items-center gap-1 text-xs sm:text-sm text-white/75 transition-colors hover:text-[var(--color-accent)]"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 sm:col-span-1">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
              Legal & Info
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 sm:block sm:space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-[36px] sm:min-h-0 items-center text-xs sm:text-sm text-white/75 transition-colors hover:text-[var(--color-accent)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar / Copyright */}
        <div className={`${compact ? "mt-6 sm:mt-10" : "mt-8 sm:mt-10"} flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:gap-1`}>
          <p className="text-center sm:text-left">© {new Date().getFullYear()} Glow with Rubi. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Developed by{" "}
            <a
              href={`mailto:${DEVELOPER.email}`}
              className="text-white/80 underline-offset-2 hover:text-[var(--color-accent)] hover:underline font-medium"
            >
              {DEVELOPER.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

