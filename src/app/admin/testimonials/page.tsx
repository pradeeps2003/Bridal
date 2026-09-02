import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { createAdminClient } from "@/lib/supabase/admin";
import { TestimonialsPageWrapper } from "./page-wrapper";
import type { Testimonial } from "@/types";

export const dynamic = "force-dynamic";

async function getAllTestimonials(): Promise<Testimonial[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, full_name, quote, event_type, is_published, created_at, booking_id")
    .order("created_at", { ascending: false });
  return (data ?? []) as Testimonial[];
}

export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonials();

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">Testimonials</h1>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              Manage customer reviews — publish, edit, or add manually.
            </p>
          </div>
        </div>

        <TestimonialsPageWrapper testimonials={testimonials} />

        <Link href="/admin" className="text-sm text-[var(--color-accent)] hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </AdminShell>
  );
}