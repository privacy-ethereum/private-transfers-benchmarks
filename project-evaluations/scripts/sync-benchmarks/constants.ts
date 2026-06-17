import { config } from "dotenv";

config();

if (!process.env.ETH_RPC_URL) {
  throw new Error("ETH_RPC_URL is not set in the environment variables");
}

if (!process.env.ARB_RPC_URL) {
  throw new Error("ARB_RPC_URL is not set in the environment variables");
}

if (!process.env.SEPOLIA_RPC_URL) {
  throw new Error("SEPOLIA_RPC_URL is not set in the environment variables");
}

if (!process.env.BASE_RPC_URL) {
  throw new Error("BASE_RPC_URL is not set in the environment variables");
}

if (!process.env.SCROLL_RPC_URL) {
  throw new Error("SCROLL_RPC_URL is not set in the environment variables");
}

if (!process.env.STARKNET_RPC_URL) {
  throw new Error("STARKNET_RPC_URL is not set in the environment variables");
}

if (!process.env.ETH_PRICE_IN_USD_API_URL) {
  throw new Error("ETH_PRICE_IN_USD_API_URL is not set in the environment variables");
}

export const {
  ETH_RPC_URL,
  ARB_RPC_URL,
  SEPOLIA_RPC_URL,
  BASE_RPC_URL,
  SCROLL_RPC_URL,
  STARKNET_RPC_URL,
  ETH_PRICE_IN_USD_API_URL,
} = process.env;

export const FALLBACK_ETH_USD = 1800;

export const FALLBACK_GAS_ETH_MAINNET = BigInt(3e8);
export const FALLBACK_GAS_ETH_ARBITRUM = BigInt(2e7);
export const FALLBACK_GAS_ETH_SEPOLIA = BigInt(1e9);
export const FALLBACK_GAS_ETH_BASE = BigInt(6e6);
export const FALLBACK_GAS_ETH_SCROLL = BigInt(1.2e5);
export const FALLBACK_GAS_ETH_STARKNET = 2n;

export const CAMEL_CASE_REGEX = /([a-z0-9])([A-Z])/g;

export const ERC_7528_NATIVE_ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const WETH_ADDRESS_IN_MAINNET = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const ETH_PRIVACY_POOLS_MAINNET = "0xf241d57c6debae225c0f2e6ea1529373c9a9c9fb";

export const DEPOSIT_PROPERTY_NAME = "On-chain gas cost: deposit";
export const TRANSFER_PROPERTY_NAME = "On-chain gas cost: transfer";
export const WITHDRAW_PROPERTY_NAME = "On-chain gas cost: withdraw";
