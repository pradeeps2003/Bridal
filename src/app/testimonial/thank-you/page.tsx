import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Thank You | Glow with Rubi",
  description: "Thank you for sharing your experience with Glow with Rubi.",
};

export default function TestimonialThankYouPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-background)] pt-24 pb-16 lg:pt-32">
        <div className="container-narrow px-6 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl mb-4">
                Thank You!
              </h1>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Your testimonial has been submitted successfully. We&apos;ll review it and publish it on our website.
              </p>
            </div>

            <Button variant="accent" asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}