/** Shapes shared across the scraper, store, and MCP layers. */

/** Raw, loosely-typed data pulled straight out of a product page. */
export interface RawOffer {
  sku?: string;
  price: number;
  listPrice?: number;
  currency: string;
  inStock: boolean;
  attributes?: Record<string, string>;
}

export interface RawProduct {
  id: string;
  url: string;
  name: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  offers: RawOffer[];
}

/** Normalized records, ready to persist. Prices are integer minor units (céntimos). */
export interface ProductRecord {
  id: string;
  url: string;
  name: string;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
}

export interface VariantRecord {
  sku: string;
  productId: string;
  attributes: Record<string, string> | null;
}

export interface PriceSnapshotRecord {
  sku: string;
  date: string;
  price: number;
  listPrice: number | null;
  currency: string;
  inStock: boolean;
}

export interface NormalizedProduct {
  product: ProductRecord;
  variants: VariantRecord[];
  snapshots: PriceSnapshotRecord[];
}

export interface ScrapeSummary {
  productsSeen: number;
  snapshotsWritten: number;
  unchanged: number;
  errors: number;
}
