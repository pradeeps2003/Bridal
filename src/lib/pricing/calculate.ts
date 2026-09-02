import type { Addon, Coupon, Package, PaymentSettings, PriceBreakdown, ServiceSettings } from "@/types";
import { isNegotiableAddon } from "@/lib/addons/pricing";

export interface CalculatePriceInput {
  pkg: Package;
  addons: Array<Pick<Addon, "id" | "price" | "slug"> & { pricing_type?: Addon["pricing_type"] }>;
  addonQuantities?: Record<string, number>;
  locationType: "home" | "studio";
  serviceSettings: ServiceSettings;
  paymentSettings: PaymentSettings;
  discount?: number;
  coupon?: Coupon | null;
  /** Distance from studio in km (optional; used for radius-based travel fee) */
  distanceKm?: number;
}

export function calculateBookingPrice(input: CalculatePriceInput): PriceBreakdown {
  const isCustomQuote = input.pkg.pricing_type === "CUSTOM_QUOTE";
  const hasNegotiableAddons = input.addons.some((addon) => isNegotiableAddon(addon));

  const subtotal = isCustomQuote ? 0 : Number(input.pkg.price);
  const addons_total = input.addons.reduce((sum, addon) => {
    if (isNegotiableAddon(addon)) return sum;
    const qty = input.addonQuantities?.[addon.id] ?? 1;
    return sum + Number(addon.price) * qty;
  }, 0);

  // Travel fee: only for home service; free within radius, charged beyond it
  let travel_fee = 0;
  if (input.locationType === "home" && input.serviceSettings.home_service_enabled) {
    const radiusKm = input.serviceSettings.travel_radius_km ?? 40;
    if (input.distanceKm !== undefined && input.distanceKm !== null) {
      if (input.distanceKm > radiusKm) {
        travel_fee =
          Number(input.serviceSettings.travel_charge_base) +
          Math.ceil(input.distanceKm - radiusKm) *
            Number(input.serviceSettings.travel_charge_per_km);
      }
      // else: within free radius, no charge
    } else {
      // Fallback: flat base fee when distance is unknown
      travel_fee = Number(input.serviceSettings.travel_charge_base);
    }
  }

  // Calculate sale discount from package
  let sale_discount = 0;
  if (!isCustomQuote && input.pkg.sale_type && input.pkg.sale_type !== "none") {
    const now = new Date();
    const saleStart = input.pkg.sale_starts_at ? new Date(input.pkg.sale_starts_at) : null;
    const saleEnd = input.pkg.sale_ends_at ? new Date(input.pkg.sale_ends_at) : null;

    if ((!saleStart || now >= saleStart) && (!saleEnd || now <= saleEnd)) {
      if (input.pkg.sale_type === "percent") {
        sale_discount = Math.round(subtotal * (input.pkg.sale_value || 0) / 100);
      } else {
        sale_discount = input.pkg.sale_value || 0;
      }
    }
  }

  // Calculate coupon discount
  let coupon_discount = 0;
  if (input.coupon && input.coupon.is_active) {
    const now = new Date();
    const couponStart = input.coupon.starts_at ? new Date(input.coupon.starts_at) : null;
    const couponEnd = input.coupon.ends_at ? new Date(input.coupon.ends_at) : null;

    const isValidDate = (!couponStart || now >= couponStart) && (!couponEnd || now <= couponEnd);
    const isValidUsage = !input.coupon.max_uses || input.coupon.used_count < input.coupon.max_uses;
    const isValidPackage = input.coupon.package_ids.length === 0 || input.coupon.package_ids.includes(input.pkg.id);
    const meetsMinOrder = subtotal + addons_total >= input.coupon.min_order;

    if (isValidDate && isValidUsage && isValidPackage && meetsMinOrder) {
      const afterSale = Math.max(0, subtotal + addons_total - sale_discount);
      if (input.coupon.type === "percent") {
        coupon_discount = Math.round(afterSale * input.coupon.value / 100);
      } else {
        coupon_discount = Math.min(input.coupon.value, afterSale);
      }
    }
  }

  const total = Math.max(0, subtotal + addons_total + travel_fee - sale_discount - coupon_discount);

  let advance = 0;
  if (!isCustomQuote && total > 0) {
    if (input.paymentSettings.mode === "FIXED_ADVANCE") {
      advance = Math.min(total, Number(input.paymentSettings.fixed_advance));
    } else {
      advance = Math.round((total * Number(input.paymentSettings.advance_percentage)) / 100);
    }
  }

  const balance = Math.max(0, total - advance);

  return {
    subtotal,
    addons_total,
    travel_fee,
    discount: sale_discount + coupon_discount,
    total,
    advance,
    balance,
    is_custom_quote: isCustomQuote,
    has_negotiable_addons: hasNegotiableAddons,
  };
}

export function getPackageSalePrice(pkg: Package): number | null {
  if (pkg.pricing_type === "CUSTOM_QUOTE" || !pkg.sale_type || pkg.sale_type === "none") {
    return null;
  }

  const now = new Date();
  const saleStart = pkg.sale_starts_at ? new Date(pkg.sale_starts_at) : null;
  const saleEnd = pkg.sale_ends_at ? new Date(pkg.sale_ends_at) : null;

  if ((!saleStart || now >= saleStart) && (!saleEnd || now <= saleEnd)) {
    if (pkg.sale_type === "percent") {
      return Math.round(pkg.price * (1 - (pkg.sale_value || 0) / 100));
    } else {
      return Math.max(0, pkg.price - (pkg.sale_value || 0));
    }
  }

  return null;
}

export function addHoursToTime(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + hours * 60;
  const nh = Math.floor(totalMinutes / 60) % 24;
  const nm = totalMinutes % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}:00`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
