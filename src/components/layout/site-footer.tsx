import Link from "next/link";
import Image from "next/image";

import { BrandLogo } from "@/components/brand/brand-logo";

const DEVELOPER = {
  name: "Pradeep",
  email: "gokulpradeep2003@gmail.com",
};

const footerLooks = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80",
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80",
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80",
];

const footerLinks = {
  explore: [
    { href: "/packages", label: "Packages" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ],
  connect: [
    { href: "https://instagram.com/glow_with_rubi", label: "Instagram", external: true },
    { href: "/book", label: "Book Now" },
    { href: "/login", label: "Client login" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Settings" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-[hsl(345_40%_8%)] text-[hsl(30_25%_92%)]">
      <div className="grid grid-cols-3 sm:grid-cols-6">
        {footerLooks.map((src) => (
          <div key={src} className="relative aspect-[4/5] opacity-70 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0">
            <Image src={src} alt="" fill className="object-cover" sizes="16vw" />
          </div>
        ))}
      </div>

      <div className="container-wide px-4 py-12 sm:px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <BrandLogo className="h-20 max-h-20 sm:h-24 sm:max-h-24" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
              Premium bridal HD makeup from Pollachi. Home and venue service in Coimbatore, Tiruppur, Udumalpet, Valparai, and across Tamil Nadu — saree draping, jewellery setting, reception and engagement looks.
            </p>
          </div>
          <Link
            href="/book"
            className="inline-flex h-12 items-center rounded-full bg-[var(--color-cta)] px-6 text-sm font-semibold text-[var(--color-on-cta)] transition hover:brightness-110"
          >
            Reserve your date
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">Explore</p>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-[var(--color-accent)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">Connect</p>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => (
                <li key={link.href}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/70 hover:text-[var(--color-accent)]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-white/70 hover:text-[var(--color-accent)]">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link href="/admin/login" className="text-sm text-white/70 hover:text-[var(--color-accent)]">
                  Studio / admin login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">Legal</p>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-[var(--color-accent)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-white/10 pt-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Glow with Rubi. All rights reserved.</p>
          <p>
            Developed by{" "}
            <a
              href={`mailto:${DEVELOPER.email}`}
              className="text-white/70 underline-offset-2 hover:text-[var(--color-accent)] hover:underline"
            >
              {DEVELOPER.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
