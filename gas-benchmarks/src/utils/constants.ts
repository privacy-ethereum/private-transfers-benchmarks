import { config } from "dotenv";

config();

if (!process.env.ETH_RPC_URL) {
  throw new Error("ETH_RPC_URL is not set");
}

if (!process.env.SEPOLIA_RPC_URL) {
  throw new Error("SEPOLIA_RPC_URL is not set");
}

if (!process.env.SCROLL_RPC_URL) {
  throw new Error("SCROLL_RPC_URL is not set");
}

if (!process.env.SUBGRAPH_URL) {
  throw new Error("SUBGRAPH_URL is not set");
}

if (!process.env.MIN_SAMPLES) {
  throw new Error("MIN_SAMPLES is not set");
}

if (!process.env.BATCH_SIZE_FOR_RPC_CALLS) {
  throw new Error("BATCH_SIZE_FOR_RPC_CALLS is not set");
}

if (!process.env.DELAY_BETWEEN_BATCHES) {
  throw new Error("DELAY_BETWEEN_BATCHES is not set");
}

export const { ETH_RPC_URL, SEPOLIA_RPC_URL, SCROLL_RPC_URL, SUBGRAPH_URL } = process.env;

/** Minimum number of valid samples required per benchmark */
export const MIN_SAMPLES = Number(process.env.MIN_SAMPLES);

/** Number of RPC calls to batch together concurrently when interacting with the RPC */
export const BATCH_SIZE_FOR_RPC_CALLS = Number(process.env.BATCH_SIZE_FOR_RPC_CALLS);

/** Delay in milliseconds between batches when interacting with the RPC to avoid rate limiting */
export const DELAY_BETWEEN_BATCHES = Number(process.env.DELAY_BETWEEN_BATCHES);

/** Maximum unique logs to collect before stopping the block scan */
export const MAX_SAMPLES = 100_000;

/** Number of blocks to fetch per RPC getLogs call */
export const BLOCK_RANGE = 2_000n;

export const BENCHMARKS_OUTPUT_PATH = "./benchmarks.json";

/**
 * The number of Ethereum blocks to scan for events for 10 minutes
 * 10 minutes = 600 seconds. 1 Ethereum block = 12 seconds
 * 600 / 12 = 50 blocks
 */
export const BLOCK_WINDOW_ETHEREUM_10_MINUTES = 50n;

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
