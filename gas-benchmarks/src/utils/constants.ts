import { config } from "dotenv";

config();

if (!process.env.ETH_RPC_URL) {
  throw new Error("ETH_RPC_URL is not set");
}

if (!process.env.SCROLL_RPC_URL) {
  throw new Error("SCROLL_RPC_URL is not set");
}

if (!process.env.MIN_SAMPLES) {
  throw new Error("MIN_SAMPLES is not set");
}

export const { ETH_RPC_URL } = process.env;
export const { SCROLL_RPC_URL } = process.env;

/** Minimum number of valid samples required per benchmark */
export const MIN_SAMPLES = Number(process.env.MIN_SAMPLES);

/** Maximum unique logs to collect before stopping the block scan */
export const MAX_SAMPLES = 100_000;

/** Number of blocks to fetch per RPC getLogs call */
export const BLOCK_RANGE = 2_000n;

export const BENCHMARKS_OUTPUT_PATH = "./benchmarks.json";

/**
 * The number of Ethereum blocks to scan for events
 * 1 week = 604800 seconds. 1 Ethereum block = 12 seconds
 * 604800 / 12 = 50400 seconds
 */
export const BLOCK_WINDOW_ETHEREUM = 50_400n;

/**
 * The number of Scroll blocks to scan for events
 * 1 week = 604800 seconds. 1 Scroll block = 1 second
 * 604800 / 1 = 604800 seconds
 */
export const BLOCK_WINDOW_SCROLL = 604_800n;
