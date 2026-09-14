"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

import { readCookiePreferences, writeCookiePreferences } from "@/lib/privacy/cookie-consent";

export function CookieBanner() {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      setShowBanner(false);
      return;
    }
    setShowBanner(!readCookiePreferences());
  }, [pathname]);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-lg">
      <div className="container-wide mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-medium text-[var(--color-foreground)]">Cookies on this site</p>
            <p className="mt-1 text-[var(--color-muted-foreground)]">
              Necessary cookies keep login working. Analytics (Google) and marketing (Meta) load only if you allow them and the site IDs are configured.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => { window.location.href = "/cookies"; }}>
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              writeCookiePreferences({ necessary: true, analytics: false, marketing: false });
              setShowBanner(false);
            }}
          >
            Necessary only
          </Button>
          <Button
            size="sm"
            className="text-xs"
            onClick={() => {
              writeCookiePreferences({ necessary: true, analytics: true, marketing: true });
              setShowBanner(false);
              window.location.reload();
            }}
          >
            Allow analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
