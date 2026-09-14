"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Cookie, Check } from "lucide-react";
import {
  DEFAULT_COOKIE_PREFERENCES,
  readCookiePreferences,
  writeCookiePreferences,
  type CookiePreferences,
} from "@/lib/privacy/cookie-consent";

export default function CookieSettingsPage() {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_COOKIE_PREFERENCES);
  const [saved, setSaved] = useState(false);
  const ga4Configured = Boolean(process.env.NEXT_PUBLIC_GA4_ID);
  const metaConfigured = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID);

  useEffect(() => {
    setPreferences(readCookiePreferences() ?? DEFAULT_COOKIE_PREFERENCES);
  }, []);

  const handleSave = () => {
    writeCookiePreferences(preferences);
    setSaved(true);
  };

  return (
    <PageShell>
      <div className="container-narrow section-padding">
        <div className="max-w-3xl">
          <h1 className="mb-6 font-[family-name:var(--font-heading)] text-4xl font-bold">Cookie settings</h1>
          <p className="mb-8 text-sm text-[var(--color-muted-foreground)]">
            Necessary cookies always run (login, security). Google Analytics loads only if you enable Analytics and{" "}
            <code className="text-[var(--color-foreground)]">NEXT_PUBLIC_GA4_ID</code> is set. Meta Pixel loads only if you enable Marketing and{" "}
            <code className="text-[var(--color-foreground)]">NEXT_PUBLIC_META_PIXEL_ID</code> is set. Tracking scripts never load in local development.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Status</h2>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                <p>Google Analytics ID: {ga4Configured ? "configured" : "not set — analytics cannot fire yet"}</p>
                <p>Meta Pixel ID: {metaConfigured ? "configured" : "not set — marketing pixel cannot fire yet"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Preferences</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/20 p-4">
                  <div className="flex items-start gap-3">
                    <Cookie className="mt-0.5 h-5 w-5 text-[var(--color-accent)]" />
                    <div>
                      <h3 className="font-medium">Necessary</h3>
                      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Authentication and security. Always on.</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-accent)]">
                    Always on <Check className="h-4 w-4" />
                  </span>
                </div>

                <div className="flex items-start justify-between rounded-lg border border-[var(--color-border)] p-4">
                  <div>
                    <h3 className="font-medium">Analytics</h3>
                    <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Anonymous page views via Google Analytics 4.</p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={preferences.analytics}
                    onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                    className={`h-6 w-12 cursor-pointer rounded-full p-1 transition-colors ${
                      preferences.analytics ? "bg-[var(--color-accent)]" : "bg-[var(--color-muted)]"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${preferences.analytics ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between rounded-lg border border-[var(--color-border)] p-4">
                  <div>
                    <h3 className="font-medium">Marketing</h3>
                    <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Meta Pixel for ads measurement.</p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={preferences.marketing}
                    onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                    className={`h-6 w-12 cursor-pointer rounded-full p-1 transition-colors ${
                      preferences.marketing ? "bg-[var(--color-accent)]" : "bg-[var(--color-muted)]"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${preferences.marketing ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleSave} className="flex-1">Save preferences</Button>
              <Button variant="outline" onClick={() => setPreferences(DEFAULT_COOKIE_PREFERENCES)}>
                Necessary only
              </Button>
            </div>
          </div>
        </div>
        <FeedbackDialog
          open={saved}
          title="Preferences saved"
          message="Reload the site if you just allowed analytics so tracking can start."
          tone="success"
          onClose={() => setSaved(false)}
        />
      </div>
    </PageShell>
  );
}
