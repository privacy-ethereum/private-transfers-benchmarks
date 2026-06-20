/**
 * Runtime configuration, sourced from environment variables with safe defaults.
 *
 * Load a local `.env` with Node's native flag, e.g.:
 *   node --env-file=.env dist/run.js
 */

const num = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const trimSlash = (url: string): string => url.replace(/\/+$/, "");

const baseUrl = trimSlash(process.env.BASE_URL ?? "https://www.tiendasekono.com");

export const config = {
  baseUrl,
  sitemapUrl: process.env.SITEMAP_URL ?? `${baseUrl}/sitemap.xml`,
  dbPath: process.env.DB_PATH ?? "./data/ekono.sqlite",
  concurrency: num(process.env.CONCURRENCY, 3),
  requestDelayMs: num(process.env.REQUEST_DELAY_MS, 250),
  requestTimeoutMs: num(process.env.REQUEST_TIMEOUT_MS, 20_000),
  maxRetries: num(process.env.MAX_RETRIES, 4),
  userAgent:
    process.env.USER_AGENT ??
    "ekono-price-bot/0.1 (+https://github.com/your-org/ekono-scraper)",
} as const;

export type Config = typeof config;
