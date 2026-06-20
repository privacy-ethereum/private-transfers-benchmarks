/**
 * SQLite schema. Kept as a string so the binary is fully self-contained at
 * deploy time (no sidecar .sql file to locate).
 *
 * Design note — delta storage: `price_snapshots` is append-only and we only
 * insert a row when a variant's price/stock actually *changed* versus the last
 * stored snapshot. Most days are no-ops, which keeps history small. To read the
 * price on an arbitrary date, take the latest snapshot with `date <= target`.
 */
export const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY,
  url           TEXT NOT NULL,
  name          TEXT NOT NULL,
  brand         TEXT,
  category      TEXT,
  image_url     TEXT,
  etag          TEXT,
  last_modified TEXT,
  first_seen    TEXT NOT NULL,
  last_seen     TEXT NOT NULL,
  active        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS variants (
  sku         TEXT PRIMARY KEY,
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attributes  TEXT
);

CREATE TABLE IF NOT EXISTS price_snapshots (
  sku        TEXT NOT NULL REFERENCES variants(sku) ON DELETE CASCADE,
  date       TEXT NOT NULL,
  price      INTEGER NOT NULL,
  list_price INTEGER,
  currency   TEXT NOT NULL DEFAULT 'CRC',
  in_stock   INTEGER NOT NULL,
  PRIMARY KEY (sku, date)
);

CREATE TABLE IF NOT EXISTS scrape_runs (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at        TEXT NOT NULL,
  finished_at       TEXT,
  products_seen     INTEGER NOT NULL DEFAULT 0,
  snapshots_written INTEGER NOT NULL DEFAULT 0,
  errors            INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'running'
);

CREATE INDEX IF NOT EXISTS idx_snap_date    ON price_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_variant_prod ON variants(product_id);
CREATE INDEX IF NOT EXISTS idx_prod_name    ON products(name);
CREATE INDEX IF NOT EXISTS idx_prod_active  ON products(active);
`;
