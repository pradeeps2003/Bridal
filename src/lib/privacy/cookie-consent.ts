export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export const COOKIE_CONSENT_KEY = "cookieConsent";
export const COOKIE_PREFERENCES_KEY = "cookiePreferences";

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function parseCookiePreferences(raw: string | null): CookiePreferences | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return null;
  }
}

export function preferencesFromSimpleConsent(value: string | null): CookiePreferences | null {
  if (value === "accepted") return { necessary: true, analytics: true, marketing: true };
  if (value === "declined") return { necessary: true, analytics: false, marketing: false };
  return null;
}

export function readCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  return (
    parseCookiePreferences(localStorage.getItem(COOKIE_PREFERENCES_KEY)) ??
    preferencesFromSimpleConsent(localStorage.getItem(COOKIE_CONSENT_KEY))
  );
}

export function writeCookiePreferences(preferences: CookiePreferences) {
  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
  localStorage.setItem(
    COOKIE_CONSENT_KEY,
    preferences.analytics || preferences.marketing ? "accepted" : "declined",
  );
}
