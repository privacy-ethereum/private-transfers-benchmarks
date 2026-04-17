import { config } from "dotenv";

config();

if (!process.env.ETH_RPC_URL) {
  throw new Error("ETH_RPC_URL is not set");
}

if (!process.env.SCROLL_RPC_URL) {
  throw new Error("SCROLL_RPC_URL is not set");
}

if (!process.env.SEPOLIA_RPC_URL) {
  throw new Error("SEPOLIA_RPC_URL is not set");
}

if (!process.env.MIN_SAMPLES) {
  throw new Error("MIN_SAMPLES is not set");
}

export const { ETH_RPC_URL } = process.env;
export const { SCROLL_RPC_URL } = process.env;
export const { SEPOLIA_RPC_URL } = process.env;

/** Minimum number of valid samples required per benchmark */
export const MIN_SAMPLES = Number(process.env.MIN_SAMPLES);

/** Maximum unique logs to collect before stopping the block scan */
export const MAX_SAMPLES = 100_000;

/** Number of blocks to fetch per RPC getLogs call */
export const BLOCK_RANGE = 2_000n;

/** How many RPC calls will be performed concurrently */
export const BATCH_SIZE_FOR_RPC_CALLS = 1500;

export const BENCHMARKS_OUTPUT_PATH = "./benchmarks.json";

/**
 * The number of Ethereum blocks to scan for events for 10 minutes
 * 10 minutes = 600 seconds. 1 Ethereum block = 12 seconds
 * 600 / 12 = 50 blocks
 */
export const BLOCK_WINDOW_ETHEREUM_10_MINUTES = 50n;

/**
 * The number of Ethereum blocks to scan for events for 3 days
 * 3 days = 259200 seconds. 1 Ethereum block = 12 seconds
 * 259200 / 12 = 21600 blocks
 */
export const BLOCK_WINDOW_ETHEREUM_3_DAYS = 21_600n;

/**
 * The number of Ethereum blocks to scan for events for 1 week
 * 1 week = 604800 seconds. 1 Ethereum block = 12 seconds
 * 604800 / 12 = 50400 blocks
 */
export const BLOCK_WINDOW_ETHEREUM_1_WEEK = 50_400n;

/**
 * The number of Ethereum blocks to scan for events for 5 weeks
 * 5 weeks = 3024000 seconds. 1 Ethereum block = 12 seconds
 * 3024000 / 12 = 252000 blocks
 */
export const BLOCK_WINDOW_ETHEREUM_5_WEEKS = 252_000n;

/**
 * The number of Scroll blocks to scan for events for 1 week
 * 1 week = 604800 seconds. 1 Scroll block = 1 second
 * 604800 / 1 = 604800 blocks
 */
export const BLOCK_WINDOW_SCROLL_1_WEEK = 604_800n;

/**
 * The number of Monero blocks to scan for transactions
 * 1 week = 604800 seconds. 1 Monero block = 120 seconds
 * 604800 / 120 = 5040 blocks
 *
 * Using 5 for dev and rate limiting on remote node
 */
export const BLOCK_WINDOW_MONERO = 5;
