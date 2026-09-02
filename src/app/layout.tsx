import type { Metadata, Viewport } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/seo/analytics";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { WhatsAppWidget } from "@/components/ui/whatsapp-widget";
import { CookieBanner } from "@/components/layout/cookie-banner";

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Glow with Rubi | Premium Bridal & Occasion Makeup",
    template: "%s | Glow with Rubi",
  },
  description:
    "Luxury bridal and occasion makeup artistry. Book your date for flawless, editorial-quality looks tailored to your celebration.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Glow with Rubi",
    title: "Glow with Rubi | Premium Bridal & Occasion Makeup",
    description: "Luxury bridal and occasion makeup artistry. Book your date for flawless, editorial-quality looks tailored to your celebration.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Glow with Rubi - Premium Bridal Makeup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glow with Rubi | Premium Bridal & Occasion Makeup",
    description: "Luxury bridal and occasion makeup artistry. Book your date for flawless, editorial-quality looks tailored to your celebration.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf9",
  width: "device-width",
  initialScale: 1,
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;


  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={`${cormorant.variable} ${montserrat.variable} w-full`}
    >
      <head>
        {gscVerification && (
          <meta name="google-site-verification" content={gscVerification} />
        )}

        {/* Inline dark-mode script to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased w-full overflow-x-hidden">
        <ThemeProvider>
          <Analytics />
          {children}
          <WhatsAppWidget />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
