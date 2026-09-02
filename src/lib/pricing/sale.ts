import type { Package } from "@/types";

export function isSaleActive(pkg: Pick<Package, "sale_type" | "sale_value" | "sale_starts_at" | "sale_ends_at" | "pricing_type">, now = new Date()): boolean {
  if (pkg.pricing_type === "CUSTOM_QUOTE") return false;
  if (!pkg.sale_type || pkg.sale_type === "none") return false;
  const value = Number(pkg.sale_value ?? 0);
  if (value <= 0) return false;
  if (pkg.sale_starts_at && new Date(pkg.sale_starts_at) > now) return false;
  if (pkg.sale_ends_at && new Date(pkg.sale_ends_at) < now) return false;
  return true;
}

export function getSaleDiscount(
  pkg: Pick<Package, "sale_type" | "sale_value" | "sale_starts_at" | "sale_ends_at" | "pricing_type">,
  listPrice: number,
  now = new Date(),
): number {
  if (!isSaleActive(pkg, now)) return 0;
  if (pkg.sale_type === "percent") {
    return Math.min(listPrice, Math.round((listPrice * Number(pkg.sale_value)) / 100));
  }
  return Math.min(listPrice, Number(pkg.sale_value));
}

export function getDisplayPrices(pkg: Package) {
  const listPrice = Number(pkg.price);
  const saleDiscount = getSaleDiscount(pkg, listPrice);
  return {
    listPrice,
    saleDiscount,
    payable: Math.max(0, listPrice - saleDiscount),
    onSale: saleDiscount > 0,
  };
}
