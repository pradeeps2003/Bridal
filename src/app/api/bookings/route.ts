import { NextResponse } from "next/server";

import { isNegotiableAddon } from "@/lib/addons/pricing";
import { isSlotAvailable } from "@/lib/data/availability";
import { getAddonsByIds } from "@/lib/data/addons";
import {
  getBookingSettings,
  getPaymentSettings,
  getServiceSettings,
} from "@/lib/data/settings";
import { notifyNewBooking } from "@/lib/notifications/orchestrator";
import { addHoursToTime, calculateBookingPrice, getPackageSalePrice } from "@/lib/pricing/calculate";
import { createBookingSchema } from "@/lib/booking/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { tryCreateClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const supabase = createAdminClient();

    const { data: pkg, error: pkgError } = await supabase
      .from("packages")
      .select("*, services(id, name, slug)")
      .eq("id", input.package_id)
      .eq("is_active", true)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Validate coupon if provided
    let coupon = null;
    if (input.coupon_code) {
      const { data: couponData, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", input.coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (couponError || !couponData) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }

      // Check coupon validity
      const now = new Date();
      const couponStart = couponData.starts_at ? new Date(couponData.starts_at) : null;
      const couponEnd = couponData.ends_at ? new Date(couponData.ends_at) : null;

      const isValidDate = (!couponStart || now >= couponStart) && (!couponEnd || now <= couponEnd);
      const isValidUsage = !couponData.max_uses || couponData.used_count < couponData.max_uses;
      const isValidPackage = couponData.package_ids.length === 0 || couponData.package_ids.includes(pkg.id);

      if (!isValidDate || !isValidUsage || !isValidPackage) {
        return NextResponse.json({ error: "Coupon is not valid for this booking" }, { status: 400 });
      }

      coupon = couponData;
    }

    const startTime =
      input.start_time.length === 5 ? `${input.start_time}:00` : input.start_time;

    const available = await isSlotAvailable(input.event_date, startTime, input.package_id);
    if (!available) {
      return NextResponse.json({ error: "Selected time slot is no longer available" }, { status: 409 });
    }

    const addons = await getAddonsByIds(input.addon_ids);
    const [bookingSettings, paymentSettings, serviceSettings] = await Promise.all([
      getBookingSettings(),
      getPaymentSettings(),
      getServiceSettings(),
    ]);

    const pricing = calculateBookingPrice({
      pkg: { ...pkg, price: Number(pkg.price) },
      addons,
      locationType: input.location_type,
      serviceSettings,
      paymentSettings,
      coupon,
    });

    // Calculate sale and coupon discounts separately
    const salePrice = getPackageSalePrice({ ...pkg, price: Number(pkg.price) });
    let sale_discount = 0;
    let coupon_discount = 0;

    if (salePrice !== null) {
      sale_discount = Number(pkg.price) - salePrice;
    }

    if (coupon) {
      const afterSale = Math.max(0, pricing.subtotal + pricing.addons_total - sale_discount);
      if (coupon.type === "percent") {
        coupon_discount = Math.round(afterSale * coupon.value / 100);
      } else {
        coupon_discount = Math.min(coupon.value, afterSale);
      }
    }

    const endTime = addHoursToTime(startTime.slice(0, 5), pkg.duration_hours as number);
    const holdExpires = new Date(
      Date.now() + bookingSettings.hold_duration_hours * 60 * 60 * 1000,
    ).toISOString();

    const isCustomQuote = pkg.pricing_type === "CUSTOM_QUOTE";
    const initialStatus = isCustomQuote ? "REQUESTED" : "HELD";

    let authUserId: string | null = null;
    try {
      const authClient = await tryCreateClient();
      if (authClient) {
        const {
          data: { user },
        } = await authClient.auth.getUser();
        authUserId = user?.id ?? null;
      }
    } catch {
      // Guest bookings do not have an authenticated customer.
    }

    const customerPayload = {
      auth_user_id: authUserId,
      full_name: input.customer.full_name,
      phone: input.customer.phone,
      email: input.customer.email || null,
      whatsapp: input.customer.whatsapp || input.customer.phone,
    };

    const customerQuery = authUserId
      ? supabase.from("customers").upsert(customerPayload, { onConflict: "auth_user_id" })
      : supabase.from("customers").insert(customerPayload);
    const { data: customer, error: customerError } = await customerQuery
      .select("id")
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: "Failed to create customer record" }, { status: 500 });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_id: customer.id,
        package_id: pkg.id,
        service_id: pkg.service_id,
        status: initialStatus,
        event_date: input.event_date,
        start_time: startTime,
        end_time: endTime,
        location_type: input.location_type,
        address: input.address ?? null,
        pincode: input.pincode ?? null,
        subtotal: pricing.subtotal,
        addons_total: pricing.addons_total,
        travel_fee: pricing.travel_fee,
        discount: pricing.discount,
        sale_discount,
        coupon_discount,
        coupon_id: coupon?.id || null,
        total: pricing.total,
        advance: pricing.advance,
        balance: pricing.balance,
        hold_expires_at: isCustomQuote ? null : holdExpires,
        notes: input.notes ?? null,
      })
      .select("id, status, total, advance, hold_expires_at")
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: bookingError?.message ?? "Failed to create booking" },
        { status: 500 },
      );
    }

    if (addons.length) {
      await supabase.from("booking_items").insert(
        addons.map((addon) => ({
          booking_id: booking.id,
          addon_id: addon.id,
          label: addon.name,
          quantity: 1,
          unit_price: isNegotiableAddon(addon) ? 0 : addon.price,
          total_price: isNegotiableAddon(addon) ? 0 : addon.price,
        })),
      );
    }

    // Increment coupon usage count if coupon was used
    if (coupon) {
      await supabase
        .from("coupons")
        .update({ used_count: coupon.used_count + 1, updated_at: new Date().toISOString() })
        .eq("id", coupon.id);
    }

    await notifyNewBooking({
      bookingId: booking.id,
      customerName: input.customer.full_name,
      customerPhone: input.customer.whatsapp || input.customer.phone,
      customerEmail: input.customer.email || null,
      packageName: pkg.name as string,
      date: input.event_date,
      time: startTime.slice(0, 5),
      total: String(pricing.total),
    }).catch((notificationError) => {
      // Notification delivery must never turn a successful booking into a 500.
      console.error("[bookings] Notification orchestration failed:", notificationError);
    });

    return NextResponse.json({
      data: {
        id: booking.id,
        status: booking.status,
        total: booking.total,
        advance: booking.advance,
        hold_expires_at: booking.hold_expires_at,
        is_custom_quote: isCustomQuote,
      },
    });
  } catch (err) {
    console.error("[bookings] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
