"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  const handleSettings = () => {
    // Navigate to cookie settings page
    window.location.href = '/cookies';
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-card)] border-t border-[var(--color-border)] p-4 shadow-lg">
      <div className="container-wide max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="h-5 w-5 text-[var(--color-accent)] mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-[var(--color-foreground)]">
              We use cookies to enhance your experience
            </p>
            <p className="text-[var(--color-muted-foreground)] mt-1">
              By continuing to use this site, you agree to our use of cookies for analytics and personalized content.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSettings}
            className="text-xs"
          >
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDecline}
            className="text-xs"
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="text-xs"
          >
            Accept
          </Button>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-[var(--color-muted)]/50 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </button>
        </div>
      </div>
    </div>
  );
}