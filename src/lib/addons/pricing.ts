import type { Addon, PricingType } from "@/types";

const NEGOTIABLE_SLUGS = new Set([
  "hair-extension",
  "jewellery-setting",
  "additional-draping",
]);

const HIDDEN_ON_BOOKING_SLUGS = new Set(["travel"]);

export function addonPricingType(addon: Pick<Addon, "slug"> & { pricing_type?: PricingType }): PricingType {
  if (addon.pricing_type) return addon.pricing_type;
  return NEGOTIABLE_SLUGS.has(addon.slug) ? "CUSTOM_QUOTE" : "FIXED";
}

export function isNegotiableAddon(addon: Pick<Addon, "slug"> & { pricing_type?: PricingType }) {
  return addonPricingType(addon) === "CUSTOM_QUOTE";
}

export function visibleBookingAddons(addons: Addon[]) {
  return addons.filter((addon) => !HIDDEN_ON_BOOKING_SLUGS.has(addon.slug));
}
