import Link from "next/link";

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
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)]">
      <div className="container-wide px-4 sm:px-6 py-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-accent)]">
              Glow with Rubi
            </p>
            <p className="max-w-xs text-xs leading-relaxed text-[var(--color-muted-foreground)]">
              Premium bridal makeup artistry. Book a date, chat on WhatsApp, or visit the studio dashboard separately from client login.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">Explore</p>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)]">
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
                      className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)]">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link href="/admin/login" className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)]">
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
                  <Link href={link.href} className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-1 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Glow with Rubi. All rights reserved.</p>
          <p>Home service available across select locations.</p>
        </div>
      </div>
    </footer>
  );
}
