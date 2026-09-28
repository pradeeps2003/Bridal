import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@/components/seo/analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { getServerEnv } from "@/lib/env";
import { SEO_DESCRIPTION, SEO_KEYWORDS } from "@/lib/seo/service-area";
import { getSiteUrl } from "@/lib/seo/site-url";

const { GSC_VERIFICATION } = getServerEnv();

const cormorant = localFont({
  src: "./fonts/cormorant-variable.woff2",
  variable: "--font-heading",
  display: "swap",
  weight: "400 700",
  preload: true,
});

const montserrat = localFont({
  src: "./fonts/montserrat-variable.woff2",
  variable: "--font-body",
  display: "swap",
  weight: "300 700",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Glow with Rubi | Bridal Makeup in Pollachi, Coimbatore & Tamil Nadu",
    template: "%s | Glow with Rubi",
  },
  description: SEO_DESCRIPTION,
  applicationName: "Glow with Rubi",
  keywords: [...SEO_KEYWORDS],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
  verification: GSC_VERIFICATION
    ? { google: GSC_VERIFICATION }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: getSiteUrl(),
    siteName: "Glow with Rubi",
    title: "Glow with Rubi | Bridal Makeup in Pollachi, Coimbatore & Tamil Nadu",
    description: SEO_DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Glow with Rubi — bridal makeup artist in Pollachi, Coimbatore & Tamil Nadu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glow with Rubi | Bridal Makeup in Pollachi, Coimbatore & Tamil Nadu",
    description: SEO_DESCRIPTION,
    images: ["/logo.png"],
  },
  category: "beauty",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(30,35%,97%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(345,30%,6%)" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const revalidate = 3600;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={`${cormorant.variable} ${montserrat.variable} w-full`}
    >
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="min-h-screen antialiased w-full overflow-x-hidden">
        <JsonLd />
        <ThemeProvider>
          <Analytics />
          {children}
          <CookieBanner />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

