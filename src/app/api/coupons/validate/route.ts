import { NextResponse } from "next/server";

import { getCouponDiscount, isCouponUsable } from "@/lib/pricing/coupon";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, package_id, total_amount } = body;

    if (!code || !package_id || total_amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: code, package_id, total_amount" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    // Check coupon validity
    const validityError = isCouponUsable(coupon);
    if (validityError) {
      return NextResponse.json({ error: validityError }, { status: 400 });
    }

    // Check if coupon applies to this package
    if (coupon.package_ids?.length && !coupon.package_ids.includes(package_id)) {
      return NextResponse.json(
        { error: "This coupon is not applicable to this package" },
        { status: 400 },
      );
    }

    // Check minimum order value
    const minOrder = Number(coupon.min_order ?? 0);
    if (total_amount < minOrder) {
      return NextResponse.json(
        { error: `Minimum order value is ${minOrder}` },
        { status: 400 },
      );
    }

    // Calculate discount
    const discount = getCouponDiscount(coupon, total_amount, package_id);

    return NextResponse.json({
      valid: true,
      discount,
      coupon_id: coupon.id,
      coupon_type: coupon.type,
      coupon_value: coupon.value,
    });
  } catch (err) {
    console.error("[coupons/validate] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
