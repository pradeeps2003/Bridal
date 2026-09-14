import { describe, expect, it } from "vitest";

import { parseCookiePreferences, preferencesFromSimpleConsent } from "@/lib/privacy/cookie-consent";

describe("cookie consent", () => {
  it("does not enable analytics until explicitly stored", () => {
    expect(parseCookiePreferences(null)).toBeNull();
    expect(preferencesFromSimpleConsent("declined")).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  });

  it("enables analytics when the visitor accepts", () => {
    expect(preferencesFromSimpleConsent("accepted")?.analytics).toBe(true);
    expect(parseCookiePreferences(JSON.stringify({ analytics: true, marketing: false }))).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
    });
  });
});
