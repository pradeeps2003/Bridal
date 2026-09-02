"use server";

import { getCurrentAdmin } from "@/lib/data/admin";
import { canAdmin } from "@/lib/auth/permissions";
import { logAudit } from "@/lib/data/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(3).max(20).transform((value) => value.toUpperCase()),
  type: z.enum(["percent", "amount"]),
  value: z.coerce.number().positive("Value must be greater than zero"),
  min_order: z.coerce.number().min(0).default(0),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  max_uses: z.coerce.number().int().min(1).optional(),
  package_ids: z.string().optional(),
  is_active: z.coerce.boolean().default(true),
});

async function requireCouponAdmin() {
  const session = await getCurrentAdmin();
  if (!session || !canAdmin(session.admin.role as "owner" | "staff", "coupons.manage")) {
    throw new Error("You don’t have permission to manage coupons.");
  }
  return session;
}

function parsePackageIds(value?: string) {
  return value
    ? value.split(",").map((id) => id.trim()).filter(Boolean)
    : [];
}

export async function createCoupon(formData: FormData) {
  const { admin } = await requireCouponAdmin();
  const parsed = couponSchema.parse(Object.fromEntries(formData));
  const supabase = createAdminClient();

  const { data: coupon, error } = await supabase.from("coupons").insert({
    code: parsed.code,
    type: parsed.type,
    value: parsed.value,
    min_order: parsed.min_order,
    starts_at: parsed.starts_at ? new Date(parsed.starts_at).toISOString() : null,
    ends_at: parsed.ends_at ? new Date(parsed.ends_at).toISOString() : null,
    max_uses: parsed.max_uses || null,
    package_ids: parsePackageIds(parsed.package_ids),
    is_active: parsed.is_active,
  }).select("id").single();

  if (error || !coupon) throw new Error(error?.message ?? "Failed to create coupon");
  await logAudit(admin.id, "create", "coupons", coupon.id, parsed);
  revalidatePath("/admin/coupons");
}

export async function updateCoupon(id: string, formData: FormData) {
  const { admin } = await requireCouponAdmin();
  const parsed = couponSchema.parse(Object.fromEntries(formData));
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("coupons")
    .update({
      code: parsed.code,
      type: parsed.type,
      value: parsed.value,
      min_order: parsed.min_order,
      starts_at: parsed.starts_at ? new Date(parsed.starts_at).toISOString() : null,
      ends_at: parsed.ends_at ? new Date(parsed.ends_at).toISOString() : null,
      max_uses: parsed.max_uses || null,
      package_ids: parsePackageIds(parsed.package_ids),
      is_active: parsed.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  await logAudit(admin.id, "update", "coupons", id, parsed);
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  const { admin } = await requireCouponAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAudit(admin.id, "delete", "coupons", id);
  revalidatePath("/admin/coupons");
}
