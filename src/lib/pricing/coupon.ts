import type { Coupon } from "@/types";

export function isCouponUsable(coupon: Coupon, now = new Date()): string | null {
  if (!coupon.is_active) return "This coupon is not active.";
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return "This coupon is not valid yet.";
  if (coupon.ends_at && new Date(coupon.ends_at) < now) return "This coupon has expired.";
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return "This coupon has reached its usage limit.";
  }
  return null;
}

export function getCouponDiscount(coupon: Coupon, remaining: number, packageId: string): number {
  if (coupon.package_ids?.length && !coupon.package_ids.includes(packageId)) {
    return 0;
  }
  if (remaining < Number(coupon.min_order ?? 0)) return 0;
  if (coupon.type === "percent") {
    return Math.min(remaining, Math.round((remaining * Number(coupon.value)) / 100));
  }
  return Math.min(remaining, Number(coupon.value));
}
