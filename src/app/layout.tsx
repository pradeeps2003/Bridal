import type { Metadata, Viewport } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/seo/analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { SEO_DESCRIPTION, SEO_KEYWORDS } from "@/lib/seo/service-area";
import { getSiteUrl } from "@/lib/seo/site-url";

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Glow with Rubi | Bridal Makeup in Pollachi, Coimbatore & Tamil Nadu",
    template: "%s | Glow with Rubi",
  },
  description: SEO_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Glow with Rubi",
    title: "Glow with Rubi | Bridal Makeup in Pollachi, Coimbatore & Tamil Nadu",
    description: SEO_DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 800,
        alt: "Glow with Rubi makeup artist logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glow with Rubi | Bridal Makeup in Pollachi, Coimbatore & Tamil Nadu",
    description: SEO_DESCRIPTION,
    images: ["/logo.png"],
  },
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

