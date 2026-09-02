"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Cookie, Check } from "lucide-react";

export default function CookieSettingsPage() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save preferences to localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    // In production, you'd also send this to your backend/cookie consent service
    setSaved(true);
  };

  return (
    <PageShell>
      <div className="container-narrow section-padding">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold mb-6">
            Cookie Settings
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-8">
            Manage your cookie preferences to control how we use cookies on our website.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Cookie Preferences</h2>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Choose which types of cookies you allow us to use. You can change these settings at any time.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-muted)]/20">
                  <div className="flex items-start gap-3">
                    <Cookie className="h-5 w-5 text-[var(--color-accent)] mt-0.5" />
                    <div>
                      <h3 className="font-medium">Necessary Cookies</h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                        Required for the website to function properly. Includes authentication, security, and basic functionality.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-accent)] font-medium">Always Active</span>
                    <Check className="h-4 w-4 text-[var(--color-accent)]" />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 border border-[var(--color-border)] rounded-lg">
                  <div className="flex items-start gap-3">
                    <Cookie className="h-5 w-5 text-[var(--color-muted-foreground)] mt-0.5" />
                    <div>
                      <h3 className="font-medium">Analytics Cookies</h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                        Help us understand how visitors use our website by collecting anonymous usage data.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      preferences.analytics ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-muted)]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.analytics ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 border border-[var(--color-border)] rounded-lg">
                  <div className="flex items-start gap-3">
                    <Cookie className="h-5 w-5 text-[var(--color-muted-foreground)] mt-0.5" />
                    <div>
                      <h3 className="font-medium">Marketing Cookies</h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                        Used to deliver relevant advertisements and track marketing campaign effectiveness.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      preferences.marketing ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-muted)]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.marketing ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">About Cookies</h2>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[var(--color-muted-foreground)]">
                <p>
                  Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Remembering your preferences and settings</li>
                  <li>Keeping you logged in during your visit</li>
                  <li>Understanding how you use our website</li>
                  <li>Showing you relevant content and advertisements</li>
                </ul>
                <p>
                  You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleSave} className="flex-1">
                Save Preferences
              </Button>
              <Button variant="outline" onClick={() => setPreferences({ necessary: true, analytics: true, marketing: false })}>
                Reset to Default
              </Button>
            </div>
            </div>
          </div>
        </div>
        <FeedbackDialog
          open={saved}
          title="Preferences saved"
          message="Your cookie preferences have been saved on this device."
          tone="success"
          onClose={() => setSaved(false)}
        />
      </PageShell>
  );
}