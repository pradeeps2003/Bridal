/** Canonical public site. Override with APP_URL in .env / Vercel. */
export const PRODUCTION_SITE_URL = "https://rubi-makeovers.vercel.app";

export function getSiteUrl() {
  return (process.env.APP_URL || PRODUCTION_SITE_URL).replace(/\/$/, "");
}
