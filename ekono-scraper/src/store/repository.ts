import type { DB } from "./db.js";
import type {
  NormalizedProduct,
  PriceSnapshotRecord,
  ProductRecord,
  VariantRecord,
} from "../types.js";

const today = (): string => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ writes */

const upsertProduct = (db: DB, p: ProductRecord, conditional: { etag: string | null; lastModified: string | null }): void => {
  const now = today();
  db.prepare(
    `INSERT INTO products (id, url, name, brand, category, image_url, etag, last_modified, first_seen, last_seen, active)
     VALUES (@id, @url, @name, @brand, @category, @imageUrl, @etag, @lastModified, @now, @now, 1)
     ON CONFLICT(id) DO UPDATE SET
       url = @url, name = @name, brand = @brand, category = @category,
       image_url = @imageUrl, etag = @etag, last_modified = @lastModified,
       last_seen = @now, active = 1`,
  ).run({ ...p, etag: conditional.etag, lastModified: conditional.lastModified, now });
};

const upsertVariant = (db: DB, v: VariantRecord): void => {
  db.prepare(
    `INSERT INTO variants (sku, product_id, attributes)
     VALUES (@sku, @productId, @attributes)
     ON CONFLICT(sku) DO UPDATE SET product_id = @productId, attributes = @attributes`,
  ).run({ ...v, attributes: v.attributes ? JSON.stringify(v.attributes) : null });
};

/** Latest stored price for a variant, or null if none yet. */
const latestSnapshot = (db: DB, sku: string): { price: number; list_price: number | null; in_stock: number } | undefined =>
  db
    .prepare(`SELECT price, list_price, in_stock FROM price_snapshots WHERE sku = ? ORDER BY date DESC LIMIT 1`)
    .get(sku) as { price: number; list_price: number | null; in_stock: number } | undefined;

/** Insert a snapshot only when price/list/stock differ from the last one. Returns true if written. */
const appendSnapshotIfChanged = (db: DB, s: PriceSnapshotRecord): boolean => {
  const prev = latestSnapshot(db, s.sku);
  const inStock = s.inStock ? 1 : 0;
  const unchanged =
    prev !== undefined &&
    prev.price === s.price &&
    prev.list_price === s.listPrice &&
    prev.in_stock === inStock;
  if (unchanged) return false;

  db.prepare(
    `INSERT INTO price_snapshots (sku, date, price, list_price, currency, in_stock)
     VALUES (@sku, @date, @price, @listPrice, @currency, @inStock)
     ON CONFLICT(sku, date) DO UPDATE SET
       price = @price, list_price = @listPrice, currency = @currency, in_stock = @inStock`,
  ).run({ ...s, inStock });
  return true;
};

/** Persist a full normalized product in one transaction. Returns snapshots written. */
export const saveProduct = (
  db: DB,
  n: NormalizedProduct,
  conditional: { etag: string | null; lastModified: string | null },
): number => {
  const tx = db.transaction(() => {
    upsertProduct(db, n.product, conditional);
    n.variants.forEach((v) => upsertVariant(db, v));
    return n.snapshots.reduce((written, s) => written + (appendSnapshotIfChanged(db, s) ? 1 : 0), 0);
  });
  return tx();
};

/** Bump last_seen for a product whose page returned 304 Not Modified. */
export const touchProduct = (db: DB, id: string): void => {
  db.prepare(`UPDATE products SET last_seen = ?, active = 1 WHERE id = ?`).run(today(), id);
};

/** Read the stored conditional-GET validators for a product. */
export const getConditional = (db: DB, id: string): { etag: string | null; lastModified: string | null } | undefined => {
  const row = db.prepare(`SELECT etag, last_modified FROM products WHERE id = ?`).get(id) as
    | { etag: string | null; last_modified: string | null }
    | undefined;
  return row ? { etag: row.etag, lastModified: row.last_modified } : undefined;
};

/** Mark every product not seen since `cutoffDate` as inactive (dropped from catalog). */
export const deactivateStale = (db: DB, cutoffDate: string): number =>
  db.prepare(`UPDATE products SET active = 0 WHERE last_seen < ? AND active = 1`).run(cutoffDate).changes;

/* -------------------------------------------------------------- run records */

export const startRun = (db: DB): number =>
  Number(db.prepare(`INSERT INTO scrape_runs (started_at) VALUES (?)`).run(new Date().toISOString()).lastInsertRowid);

export const finishRun = (
  db: DB,
  id: number,
  stats: { productsSeen: number; snapshotsWritten: number; errors: number },
): void => {
  db.prepare(
    `UPDATE scrape_runs SET finished_at = @at, products_seen = @productsSeen,
       snapshots_written = @snapshotsWritten, errors = @errors,
       status = @status WHERE id = @id`,
  ).run({ id, at: new Date().toISOString(), ...stats, status: stats.errors > 0 ? "completed_with_errors" : "completed" });
};

/* ------------------------------------------------------------- MCP queries */

const priceOf = (cents: number): number => cents / 100;

export const searchProducts = (db: DB, query: string, limit = 20) =>
  db
    .prepare(
      `SELECT p.id, p.name, p.brand, p.category, p.url,
              (SELECT price FROM price_snapshots s JOIN variants v ON v.sku = s.sku
               WHERE v.product_id = p.id ORDER BY s.date DESC LIMIT 1) AS price_cents
       FROM products p
       WHERE p.active = 1 AND p.name LIKE ? COLLATE NOCASE
       ORDER BY p.name LIMIT ?`,
    )
    .all(`%${query}%`, limit)
    .map((r: any) => ({ ...r, price: r.price_cents != null ? priceOf(r.price_cents) : null, price_cents: undefined }));

export const getProduct = (db: DB, id: string) => {
  const product = db.prepare(`SELECT * FROM products WHERE id = ?`).get(id) as any;
  if (!product) return null;
  const variants = db.prepare(`SELECT sku, attributes FROM variants WHERE product_id = ?`).all(id) as any[];
  return {
    ...product,
    active: Boolean(product.active),
    variants: variants.map((v) => {
      const snap = latestSnapshot(db, v.sku);
      return {
        sku: v.sku,
        attributes: v.attributes ? JSON.parse(v.attributes) : null,
        price: snap ? priceOf(snap.price) : null,
        listPrice: snap?.list_price != null ? priceOf(snap.list_price) : null,
        inStock: snap ? Boolean(snap.in_stock) : null,
      };
    }),
  };
};

export const getPriceHistory = (db: DB, id: string, from?: string, to?: string) =>
  db
    .prepare(
      `SELECT s.sku, s.date, s.price, s.list_price, s.currency, s.in_stock
       FROM price_snapshots s JOIN variants v ON v.sku = s.sku
       WHERE v.product_id = ?
         AND (@from IS NULL OR s.date >= @from)
         AND (@to IS NULL OR s.date <= @to)
       ORDER BY s.sku, s.date`,
    )
    .all(id, { from: from ?? null, to: to ?? null })
    .map((r: any) => ({
      sku: r.sku,
      date: r.date,
      price: priceOf(r.price),
      listPrice: r.list_price != null ? priceOf(r.list_price) : null,
      currency: r.currency,
      inStock: Boolean(r.in_stock),
    }));

/** Products whose current price dropped at least `minPct` % versus their price on/just before `since`. */
export const listPriceDrops = (db: DB, since: string, minPct = 0) =>
  (
    db
      .prepare(
        `WITH latest AS (
           SELECT v.product_id, s.sku, s.price,
                  ROW_NUMBER() OVER (PARTITION BY s.sku ORDER BY s.date DESC) AS rn
           FROM price_snapshots s JOIN variants v ON v.sku = s.sku
         ),
         baseline AS (
           SELECT v.product_id, s.sku, s.price,
                  ROW_NUMBER() OVER (PARTITION BY s.sku ORDER BY s.date DESC) AS rn
           FROM price_snapshots s JOIN variants v ON v.sku = s.sku
           WHERE s.date <= @since
         )
         SELECT p.id, p.name, p.url,
                b.price AS old_cents, l.price AS new_cents
         FROM latest l
         JOIN baseline b ON b.sku = l.sku AND b.rn = 1
         JOIN products p ON p.id = l.product_id
         WHERE l.rn = 1 AND l.price < b.price`,
      )
      .all({ since }) as any[]
  )
    .map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      oldPrice: priceOf(r.old_cents),
      newPrice: priceOf(r.new_cents),
      dropPct: Math.round(((r.old_cents - r.new_cents) / r.old_cents) * 1000) / 10,
    }))
    .filter((r) => r.dropPct >= minPct)
    .sort((a, b) => b.dropPct - a.dropPct);

export const listCategories = (db: DB) =>
  db
    .prepare(
      `SELECT category, COUNT(*) AS count FROM products
       WHERE active = 1 AND category IS NOT NULL
       GROUP BY category ORDER BY count DESC`,
    )
    .all();

export const catalogStatus = (db: DB) => {
  const counts = db
    .prepare(`SELECT COUNT(*) AS total, SUM(active) AS active FROM products`)
    .get() as { total: number; active: number | null };
  const lastRun = db.prepare(`SELECT * FROM scrape_runs ORDER BY id DESC LIMIT 1`).get() as any;
  const snapshots = db.prepare(`SELECT COUNT(*) AS n FROM price_snapshots`).get() as { n: number };
  return {
    totalProducts: counts.total,
    activeProducts: counts.active ?? 0,
    totalSnapshots: snapshots.n,
    lastRun: lastRun ?? null,
  };
};
