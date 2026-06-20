import type { NormalizedProduct, RawProduct } from "./types.js";

/** Convert a decimal price into integer minor units (céntimos) to avoid float drift. */
const toMinorUnits = (price: number): number => Math.round(price * 100);

/**
 * Turn a loosely-typed RawProduct into persistable records for a given date.
 * Offers without a SKU become a single synthetic variant keyed by product id,
 * so product-level-only catalogs and variant-level catalogs share one schema.
 */
export const normalize = (raw: RawProduct, date: string): NormalizedProduct => {
  const product = {
    id: raw.id,
    url: raw.url,
    name: raw.name,
    brand: raw.brand ?? null,
    category: raw.category ?? null,
    imageUrl: raw.imageUrl ?? null,
  };

  const variants = raw.offers.map((offer, i) => ({
    sku: offer.sku ?? (raw.offers.length === 1 ? raw.id : `${raw.id}-${i}`),
    productId: raw.id,
    attributes: offer.attributes ?? null,
  }));

  const snapshots = raw.offers.map((offer, i) => ({
    sku: variants[i].sku,
    date,
    price: toMinorUnits(offer.price),
    listPrice: offer.listPrice != null ? toMinorUnits(offer.listPrice) : null,
    currency: offer.currency,
    inStock: offer.inStock,
  }));

  return { product, variants, snapshots };
};
