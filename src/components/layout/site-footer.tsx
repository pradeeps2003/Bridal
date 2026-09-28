import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  ExternalLink,
  Instagram,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { DEFAULT_FOOTER_IMAGE_URLS } from "@/lib/brand-media";
import { getSiteSettings } from "@/lib/data/settings";
import { getWhatsAppUrl, resolveWhatsAppNumber } from "@/lib/whatsapp";
import { FooterGallery } from "./footer-gallery";

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
  const footerLooks = settings.hero_image_urls ?? [...DEFAULT_FOOTER_IMAGE_URLS];
  const whatsappNumber = resolveWhatsAppNumber(settings.whatsapp || settings.phone);
  const whatsappUrl = whatsappNumber ? getWhatsAppUrl(whatsappNumber) : "/contact";
  const instagramUrl = settings.instagram
    ? settings.instagram.startsWith("http")
      ? settings.instagram
      : `https://instagram.com/${settings.instagram.replace(/^@/, "")}`
    : "https://instagram.com/glow_with_rubi";

  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-[hsl(345_40%_7%)] text-[hsl(30_25%_92%)]">
      {/* Footer Gallery - subtle on desktop, full scroll on mobile if non-compact */}
      <div className={compact ? "hidden sm:block opacity-60 hover:opacity-100 transition-opacity" : undefined}>
        <FooterGallery images={footerLooks} />
      </div>

      <div className={`container-wide px-4 ${compact ? "py-6 sm:py-12" : "py-8 sm:py-12"} sm:px-6`}>
        
        {/* ========================================================================= */}
        {/* MOBILE ONLY: High-Converting Hero CTA Card */}
        {/* ========================================================================= */}
        <div className="mb-8 block rounded-2xl border border-[var(--color-accent)]/30 bg-gradient-to-br from-[hsl(345_35%_12%)] via-[hsl(345_40%_9%)] to-[hsl(345_45%_6%)] p-5 shadow-lg backdrop-blur-md sm:hidden">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-accent)]">
            <Sparkles className="h-4 w-4 animate-pulse text-[var(--color-accent)]" />
            <span>Bridal Appointments & Home Service</span>
          </div>
          <h3 className="mt-1 font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-white">
            Ready to Glow on Your Special Day?
          </h3>
          <p className="mt-1 text-xs text-white/70 leading-relaxed">
            Pollachi & venue service across Coimbatore, Tiruppur, Udumalpet & Tamil Nadu.
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              href="/book"
              className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[hsl(35_80%_55%)] px-4 text-xs font-semibold text-neutral-950 shadow-md transition-all active:scale-[0.98]"
            >
              <Calendar className="h-4 w-4" />
              <span>Book Your Date Now</span>
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-4 text-xs font-medium text-[#25D366] transition-all active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Instant WhatsApp Enquiry</span>
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE ONLY: Mandatory 2x2 Quick Action Cards */}
        {/* ========================================================================= */}
        <div className="mb-8 block sm:hidden">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/packages"
              className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 transition-colors active:bg-white/10"
            >
              <div className="flex items-center justify-between text-white/80">
                <span className="text-lg">✨</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-white">Packages</p>
                <p className="text-[10px] text-white/60">View bridal rates</p>
              </div>
            </Link>

            <Link
              href="/book"
              className="flex flex-col justify-between rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 p-3.5 transition-colors active:bg-[var(--color-accent)]/20"
            >
              <div className="flex items-center justify-between text-[var(--color-accent)]">
                <Calendar className="h-4 w-4" />
                <ChevronRight className="h-3.5 w-3.5 opacity-70" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-white">Book Date</p>
                <p className="text-[10px] text-[var(--color-accent)]/80">Check availability</p>
              </div>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 transition-colors active:bg-emerald-500/20"
            >
              <div className="flex items-center justify-between text-emerald-400">
                <MessageCircle className="h-4 w-4" />
                <ExternalLink className="h-3 w-3 opacity-70" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-white">WhatsApp</p>
                <p className="text-[10px] text-emerald-300/80">Chat instantly</p>
              </div>
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between rounded-xl border border-pink-500/30 bg-pink-500/10 p-3.5 transition-colors active:bg-pink-500/20"
            >
              <div className="flex items-center justify-between text-pink-400">
                <Instagram className="h-4 w-4" />
                <ExternalLink className="h-3 w-3 opacity-70" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-white">Instagram</p>
                <p className="text-[10px] text-pink-300/80">@glow_with_rubi</p>
              </div>
            </a>
          </div>
        </div>

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
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-[36px] sm:min-h-0 items-center gap-1.5 text-xs sm:text-sm text-white/75 transition-colors hover:text-[var(--color-accent)]"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>WhatsApp Chat</span>
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

