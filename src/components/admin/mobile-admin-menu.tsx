"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AdminNav, type AdminMenuItem } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";

const MENU_ID = "admin-mobile-menu";
const CONTENT_SELECTOR = "[data-admin-content]";

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("aria-hidden"));
}

type MobileAdminMenuProps = {
  items: readonly AdminMenuItem[];
  account: React.ReactNode;
};

export function MobileAdminMenu({ items, account }: MobileAdminMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const hasOpenedRef = useRef(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  function openMenu() {
    setIsOpen(true);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) {
      if (hasOpenedRef.current) {
        window.setTimeout(() => triggerRef.current?.focus(), shouldReduceMotion ? 0 : 180);
      }
      return;
    }

    hasOpenedRef.current = true;
    const content = document.querySelector<HTMLElement>(CONTENT_SELECTOR);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    content?.setAttribute("inert", "");
    content?.setAttribute("aria-hidden", "true");

    const focusTimer = window.setTimeout(() => {
      const firstLink = panelRef.current?.querySelector<HTMLElement>(
        '[data-admin-nav-link="true"]',
      );
      (firstLink ?? panelRef.current?.querySelector<HTMLElement>("button"))?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      content?.removeAttribute("inert");
      content?.removeAttribute("aria-hidden");
    };
  }, [isOpen, shouldReduceMotion]);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-(--color-border) bg-(--color-card) px-3 sm:px-4 lg:hidden">
        <Link href="/admin" className="flex min-w-0 items-center gap-2" aria-label="Admin dashboard">
          <Sparkles className="h-5 w-5 shrink-0 text-(--color-accent)" aria-hidden="true" />
          <span className="truncate font-[family-name:var(--font-heading)] text-lg font-semibold text-(--color-foreground)">
            Glow with Rubi
          </span>
          <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-(--color-muted-foreground)">
            Admin
          </span>
        </Link>

        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          aria-label="Open admin menu"
          aria-expanded={isOpen}
          aria-controls={MENU_ID}
          onClick={openMenu}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </header>

      <AnimatePresence initial={false}>
        {isOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 h-full w-full cursor-default bg-(--color-foreground)/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.14, ease: "easeOut" }}
              onClick={closeMenu}
            />

            <motion.aside
              ref={panelRef}
              id={MENU_ID}
              role="dialog"
              aria-modal="true"
              aria-label="Admin menu"
              tabIndex={-1}
              className="fixed right-0 top-0 flex h-full w-[85vw] max-w-80 flex-col bg-[var(--color-card)] shadow-2xl"
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.18,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              <div className="flex justify-end border-b border-[var(--color-border)] p-3">
                <Button variant="ghost" size="icon" onClick={closeMenu} aria-label="Close menu" className="min-h-[44px] min-w-[44px]">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4" aria-label="Mobile navigation">
                <AdminNav
                  items={items}
                  density="sheet"
                  onNavigate={closeMenu}
                  showIcons={false}
                />
              </nav>

              <div className="shrink-0 border-t border-[var(--color-border)] p-4">
                {account}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
