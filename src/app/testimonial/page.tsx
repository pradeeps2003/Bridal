import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Share Your Experience | Glow with Rubi",
  description: "Leave a testimonial about your makeup experience with Glow with Rubi.",
};

async function submitTestimonial(formData: FormData) {
  const token = formData.get("token") as string;
  const fullName = formData.get("full_name") as string;
  const quote = formData.get("quote") as string;
  const eventType = formData.get("event_type") as string;

  const supabase = createAdminClient();

  // Find booking by review token
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id")
    .eq("review_token", token)
    .single();

  if (!booking) {
    throw new Error("Invalid or expired review link");
  }

  // Create testimonial
  const { error } = await supabase.from("testimonials").insert({
    booking_id: booking.id,
    full_name: fullName,
    quote,
    event_type: eventType || null,
    is_published: false, // Requires admin approval
  });

  if (error) {
    throw new Error("Failed to submit testimonial");
  }

  redirect("/testimonial/thank-you");
}

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
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl">
                Share Your Experience
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                We&apos;d love to hear about your experience with us
              </p>
            </div>

            <form action={submitTestimonial} className="space-y-4">
              <input type="hidden" name="token" value={token} />

              <div className="space-y-2">
                <Label htmlFor="full_name">Your Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Your Name"
                  required
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type (Optional)</Label>
                <Input
                  id="event_type"
                  name="event_type"
                  type="text"
                  placeholder="e.g. Bridal, Reception, Party"
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote">Your Testimonial</Label>
                <Textarea
                  id="quote"
                  name="quote"
                  placeholder="Share your experience with us..."
                  required
                  className="mt-1"
                  rows={4}
                />
              </div>

              <Button type="submit" variant="accent" className="w-full">
                Submit Testimonial
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-[var(--color-muted-foreground)]">
              Your testimonial will be reviewed before being published on our website.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}