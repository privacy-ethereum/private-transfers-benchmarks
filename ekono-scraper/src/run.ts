import { config } from "./config.js";
import { openDb } from "./store/db.js";
import { runScrape } from "./scraper/pipeline.js";
import { logger } from "./utils/logger.js";

/** CLI entry point for a single daily scrape. Run via cron / GitHub Action. */
const main = async (): Promise<void> => {
  const db = openDb(config.dbPath);
  try {
    const summary = await runScrape(db);
    logger.info(
      `done: seen=${summary.productsSeen} written=${summary.snapshotsWritten} ` +
        `unchanged=${summary.unchanged} errors=${summary.errors}`,
    );
    process.exitCode = summary.errors > 0 && summary.productsSeen === 0 ? 1 : 0;
  } finally {
    db.close();
  }
};

main().catch((err) => {
  logger.error(`fatal: ${(err as Error).stack ?? err}`);
  process.exit(1);
});
