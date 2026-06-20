import * as cheerio from "cheerio";
import type { RawOffer, RawProduct } from "../types.js";
import { productIdFromUrl } from "./discover.js";

/** True when a schema.org availability string indicates the item is buyable. */
const isInStock = (availability?: string): boolean =>
  !availability || /InStock|LimitedAvailability|PreOrder|BackOrder/i.test(availability);

const toNumber = (value: unknown): number | null => {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^\d.,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

const offersFromJsonLd = (node: any): RawOffer[] => {
  const raw = node.offers;
  if (!raw) return [];
  // AggregateOffer wraps an `offers` array; a single Offer is just an object.
  const list = Array.isArray(raw) ? raw : raw.offers ? (Array.isArray(raw.offers) ? raw.offers : [raw.offers]) : [raw];
  return list
    .map((o: any): RawOffer | null => {
      const price = toNumber(o.price ?? o.lowPrice);
      if (price == null) return null;
      return {
        sku: o.sku ? String(o.sku) : undefined,
        price,
        listPrice: toNumber(o.priceSpecification?.price) ?? undefined,
        currency: o.priceCurrency ?? raw.priceCurrency ?? "CRC",
        inStock: isInStock(o.availability),
      };
    })
    .filter((o: RawOffer | null): o is RawOffer => o !== null);
};

/** Find a Product node inside a JSON-LD blob that may be an array or use @graph. */
const findProductNode = (parsed: any): any | null => {
  const nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] ? parsed["@graph"] : [parsed];
  return (
    nodes.find((n: any) => {
      const t = n?.["@type"];
      return t === "Product" || (Array.isArray(t) && t.includes("Product"));
    }) ?? null
  );
};

const firstString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return firstString(value[0]);
  if (value && typeof value === "object" && "name" in value) return String((value as any).name);
  if (value && typeof value === "object" && "url" in value) return String((value as any).url);
  return undefined;
};

/**
 * Extract a product from page HTML. Prefers JSON-LD (stable across redesigns);
 * falls back to Open Graph / meta tags. Returns null if nothing usable is found.
 */
export const extractProduct = (html: string, url: string): RawProduct | null => {
  const id = productIdFromUrl(url);
  if (!id) return null;
  const $ = cheerio.load(html);

  let node: any = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (node) return;
    try {
      node = findProductNode(JSON.parse($(el).text()));
    } catch {
      /* skip malformed blocks */
    }
  });

  if (node) {
    const offers = offersFromJsonLd(node);
    if (offers.length > 0) {
      return {
        id,
        url,
        name: firstString(node.name) ?? $("title").text().trim(),
        brand: firstString(node.brand),
        category: firstString(node.category),
        imageUrl: firstString(node.image),
        offers,
      };
    }
  }

  // Fallback: Open Graph product tags.
  const ogPrice = toNumber($('meta[property="product:price:amount"]').attr("content"));
  const name = $('meta[property="og:title"]').attr("content") ?? $("title").text().trim();
  if (ogPrice == null || !name) return null;

  return {
    id,
    url,
    name,
    imageUrl: $('meta[property="og:image"]').attr("content") ?? undefined,
    offers: [
      {
        price: ogPrice,
        currency: $('meta[property="product:price:currency"]').attr("content") ?? "CRC",
        inStock: !/out.?of.?stock|agotado/i.test($('meta[property="product:availability"]').attr("content") ?? ""),
      },
    ],
  };
};
