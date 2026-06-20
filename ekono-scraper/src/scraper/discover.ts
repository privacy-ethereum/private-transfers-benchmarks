import { config } from "../config.js";
import { fetchPage } from "./fetch.js";
import { logger } from "../utils/logger.js";

/** Pull every <loc> out of a sitemap or sitemap-index document. */
const extractLocs = (xml: string): string[] =>
  [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].trim());

/** A product URL looks like `…/slug-12345.html`. */
export const isProductUrl = (url: string): boolean => /-\d+\.html(?:$|[?#])/.test(url);

/** Extract the numeric product id from a product URL. */
export const productIdFromUrl = (url: string): string | null => {
  const match = url.match(/-(\d+)\.html(?:$|[?#])/);
  return match ? match[1] : null;
};

/**
 * Walk the sitemap (following a sitemap index one level deep) and return the
 * de-duplicated list of product page URLs.
 */
export const discoverProductUrls = async (sitemapUrl = config.sitemapUrl): Promise<string[]> => {
  const root = await fetchPage(sitemapUrl);
  if (root.status !== 200) {
    logger.warn(`sitemap ${sitemapUrl} returned ${root.status}`);
    return [];
  }

  const isIndex = /<sitemapindex[\s>]/.test(root.body);
  const locs = extractLocs(root.body);

  if (!isIndex) return [...new Set(locs.filter(isProductUrl))];

  const childDocs = await Promise.all(
    locs.map(async (loc) => {
      const child = await fetchPage(loc);
      return child.status === 200 ? extractLocs(child.body) : [];
    }),
  );
  return [...new Set(childDocs.flat().filter(isProductUrl))];
};
