/** Canonical public site. Override with NEXT_PUBLIC_APP_URL in .env / Vercel. */
export const PRODUCTION_SITE_URL = "https://rubi-makeovers.vercel.app";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || PRODUCTION_SITE_URL).replace(/\/$/, "");
}
