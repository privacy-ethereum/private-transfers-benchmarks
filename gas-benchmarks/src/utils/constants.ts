import { config } from "dotenv";

config();

if (!process.env.MONERO_FAIL_NODES_API_URL) {
  throw new Error("MONERO_FAIL_NODES_API_URL is not set");
}

if (!process.env.MAINNET_SUBGRAPH_URL) {
  throw new Error("MAINNET_SUBGRAPH_URL is not set");
}

if (!process.env.SCROLL_SUBGRAPH_URL) {
  throw new Error("SCROLL_SUBGRAPH_URL is not set");
}

if (!process.env.SEPOLIA_SUBGRAPH_URL) {
  throw new Error("SEPOLIA_SUBGRAPH_URL is not set");
}

if (!process.env.ARBITRUM_SUBGRAPH_URL) {
  throw new Error("ARBITRUM_SUBGRAPH_URL is not set");
}

if (!process.env.BASE_SUBGRAPH_URL) {
  throw new Error("BASE_SUBGRAPH_URL is not set");
}

export const {
  ARBITRUM_SUBGRAPH_URL,
  BASE_SUBGRAPH_URL,
  MAINNET_SUBGRAPH_URL,
  SCROLL_SUBGRAPH_URL,
  SEPOLIA_SUBGRAPH_URL,
  MONERO_FAIL_NODES_API_URL,
} = process.env;

export const BENCHMARKS_OUTPUT_PATH = "./benchmarks.json";

/**
 * The number of Monero blocks to scan for transactions
 * 1 week = 604800 seconds. 1 Monero block = 120 seconds
 * 604800 / 120 = 5040 blocks
 *
 * Using 5 for dev and rate limiting on remote node
 */
export const BLOCK_WINDOW_MONERO = 5;

/**
 * Gas cost of a native ETH transfer in EVM
 */
export const NATIVE_ETH_TRANSFER = 21_000;

/**
 * Estimated gas cost of a WETH ERC20 token transfer in EVM
 */
export const WETH_ERC20_TRANSFER = {
  new: 50_900,
  existing: 33_800,
};

/**
 * Estimated gas cost of a USDT ERC20 token transfer in EVM
 */
export const USDT_ERC20_TRANSFER = {
  new: 53_000,
  existing: 36_000,
};

/**
 * Estimated gas cost of a USDC ERC20 token transfer in EVM
 */
export const USDC_ERC20_TRANSFER = {
  new: 62_000,
  existing: 45_000,
};
