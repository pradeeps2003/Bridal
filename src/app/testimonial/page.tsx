import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollAnimate } from "@/components/ui/scroll-animate";
import { TestimonialForm } from "@/components/forms/testimonial-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Share Your Experience | Glow with Rubi",
  description: "Leave a testimonial about your makeup experience with Glow with Rubi.",
};

export default async function TestimonialPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-[var(--color-background)] pt-24 pb-16 lg:pt-32">
          <div className="container-narrow px-6 text-center">
            <h1 className="font-[family-name:var(--font-heading)] text-4xl mb-4">
              Invalid Link
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              This testimonial link is invalid or has expired.
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-background)] pt-24 pb-16 lg:pt-32">
        <div className="container-narrow px-6">
          <ScrollAnimate animation="fade-down" delay={0.1}>
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl">
                  Share Your Experience
                </h1>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                  We&apos;d love to hear about your experience with us
                </p>
              </div>

              <TestimonialForm token={token} />

              <p className="mt-6 text-center text-xs text-[var(--color-muted-foreground)]">
                Your testimonial will be reviewed before being published on our website.
              </p>
            </div>
          </ScrollAnimate>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}