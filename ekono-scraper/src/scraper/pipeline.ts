import pLimit from "p-limit";
import { config } from "../config.js";
import type { DB } from "../store/db.js";
import type { ScrapeSummary } from "../types.js";
import { discoverProductUrls, productIdFromUrl } from "./discover.js";
import { fetchPage } from "./fetch.js";
import { extractProduct } from "./extract.js";
import { normalize } from "../normalize.js";
import {
  deactivateStale,
  finishRun,
  getConditional,
  saveProduct,
  startRun,
  touchProduct,
} from "../store/repository.js";
import { logger } from "../utils/logger.js";

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * One full daily pass: discover product URLs, fetch (conditional GET), extract,
 * normalize, and store with delta-only price snapshots. Stale products are
 * deactivated at the end.
 */
export const runScrape = async (db: DB): Promise<ScrapeSummary> => {
  const runId = startRun(db);
  const date = new Date().toISOString().slice(0, 10);

  const urls = await discoverProductUrls();
  logger.info(`discovered ${urls.length} product urls`);

  const summary: ScrapeSummary = { productsSeen: 0, snapshotsWritten: 0, unchanged: 0, errors: 0 };
  const limit = pLimit(config.concurrency);

  await Promise.all(
    urls.map((url) =>
      limit(async () => {
        const id = productIdFromUrl(url);
        if (!id) return;
        try {
          const conditional = getConditional(db, id);
          const res = await fetchPage(url, conditional);
          await sleep(config.requestDelayMs);

          if (res.status === 304) {
            touchProduct(db, id);
            summary.productsSeen += 1;
            summary.unchanged += 1;
            return;
          }
          if (res.status !== 200 || !res.body) {
            summary.errors += 1;
            logger.warn(`${url} -> ${res.status}`);
            return;
          }

          const raw = extractProduct(res.body, url);
          if (!raw) {
            summary.errors += 1;
            logger.warn(`no product data extracted from ${url}`);
            return;
          }

          const written = saveProduct(db, normalize(raw, date), {
            etag: res.etag,
            lastModified: res.lastModified,
          });
          summary.productsSeen += 1;
          summary.snapshotsWritten += written;
          if (written === 0) summary.unchanged += 1;
        } catch (err) {
          summary.errors += 1;
          logger.error(`${url} failed: ${(err as Error).message}`);
        }
      }),
    ),
  );

  const deactivated = deactivateStale(db, date);
  if (deactivated > 0) logger.info(`deactivated ${deactivated} stale products`);

  finishRun(db, runId, {
    productsSeen: summary.productsSeen,
    snapshotsWritten: summary.snapshotsWritten,
    errors: summary.errors,
  });
  return summary;
};
