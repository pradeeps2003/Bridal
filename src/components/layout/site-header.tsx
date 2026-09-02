"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, MessageCircle, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getWhatsAppUrl, resolveWhatsAppNumber } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ className }: { className?: string }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("/contact");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadWhatsApp() {
      try {
        const response = await fetch("/api/settings/business");
        if (!response.ok) return;
        const data = await response.json();
        const number = resolveWhatsAppNumber(data.whatsapp || data.phone);
        if (number) setWhatsappUrl(getWhatsAppUrl(number));
      } catch {
        const fallback = resolveWhatsAppNumber();
        if (fallback) setWhatsappUrl(getWhatsAppUrl(fallback));
      }
    }
    loadWhatsApp();
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          isScrolled
            ? "border-b border-[var(--color-border)] bg-[var(--color-card)]/95 shadow-sm backdrop-blur-xl"
            : "bg-transparent",
          className,
        )}
      >
        <div className="container-wide flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="group flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--color-accent)] sm:h-6 sm:w-6" />
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-heading)] text-base tracking-tight text-[var(--color-foreground)] sm:text-lg">
                Glow with Rubi
              </span>
              <span className="hidden text-[8px] uppercase tracking-[0.2em] text-[var(--color-muted-foreground)] sm:block sm:text-[9px]">
                Premium Makeup Artistry
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}?`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-xs font-medium transition-colors",
                    active
                      ? "bg-[var(--color-muted)] text-[var(--color-accent)]"
                      : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-10 w-10 rounded-full text-[#128C7E] hover:bg-[var(--color-muted)]"
            >
              <a
                href={whatsappUrl}
                target={whatsappUrl.startsWith("http") ? "_blank" : undefined}
                rel={whatsappUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label="Chat on WhatsApp"
                data-quick-start="whatsapp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 flex h-full w-[85vw] max-w-80 flex-col bg-[var(--color-card)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
              <span id="mobile-menu-title" className="font-[family-name:var(--font-heading)] text-base">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="min-h-[44px] min-w-[44px]">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-4" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] min-h-[44px] flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="space-y-2 border-t border-[var(--color-border)] p-4">
              <Button variant="outline" size="sm" asChild className="h-11 w-full">
                <a href={whatsappUrl} target={whatsappUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  WhatsApp us
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
