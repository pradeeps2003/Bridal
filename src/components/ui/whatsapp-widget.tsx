"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getWhatsAppUrl, resolveWhatsAppNumber } from "@/lib/whatsapp";

export function WhatsAppWidget() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [href, setHref] = useState("/contact");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings/business");
        if (response.ok) {
          const data = await response.json();
          const number = resolveWhatsAppNumber(data.whatsapp || data.phone);
          if (number) {
            setHref(getWhatsAppUrl(number));
            return;
          }
        }
      } catch {
        // Fall through to env fallback.
      }
      const fallback = resolveWhatsAppNumber();
      if (fallback) setHref(getWhatsAppUrl(fallback));
    }

    fetchSettings();
  }, []);

  if (isAdmin) return null;

  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-[#1ebe5d]"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
