import { config } from "dotenv";

import { type Property } from "../../src/types";
import { type IValueAndNotes, type IGasPrices, type IOperationStats } from "./interfaces";
import { formatEther, type Hex, hexToBigInt } from "viem";

config();

const { ETHEREUM_RPC_URL, ETH_PRICE_IN_USD_API_URL } = process.env;

const FALLBACK_ETH_USD = 3500;
const FALLBACK_GAS_ETH_GWEI = 10 * 1e-9; // 10 gwei (not confuse with wei)

export const CAMEL_CASE_REGEX = /([a-z0-9])([A-Z])/g;

export const ERC_7528_NATIVE_ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const WETH_ADDRESS_IN_MAINNET = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const ETH_PRIVACY_POOLS_ADDRESS = "0xf241d57c6debae225c0f2e6ea1529373c9a9c9fb";

export const DEPOSIT_PROPERTY_NAME = "On-chain gas cost: deposit";
export const TRANSFER_PROPERTY_NAME = "On-chain gas cost: transfer";
export const WITHDRAW_PROPERTY_NAME = "On-chain gas cost: withdraw";

export enum Protocol {
  BLANKSQUARE = "blanksquare",
  CURVY = "curvy",
  FLUIDKEY = "fluidkey",
  HINKAL = "hinkal",
  HOUDINISWAP = "houdiniswap",
  INTMAX = "intmax",
  MONERO = "monero",
  PRIVACY_POOLS = "privacy-pools",
  RAILGUN = "railgun",
  REDACT = "redact",
  TORNADO_CASH = "tornado-cash",
  VEIL_CASH = "veil-cash",
  WORM = "worm",
  ZERC20 = "zerc20",
}

/** Fetch current ETH/USD price from external API*/
async function fetchEthInUsd(): Promise<number> {
  if (!ETH_PRICE_IN_USD_API_URL) {
    throw new Error("ETH_PRICE_IN_USD_API_URL is not set in the environment variables");
  }

  const response = await fetch(ETH_PRICE_IN_USD_API_URL);
  const json = (await response.json()) as { ethereum: { usd: number } };
  return json.ethereum.usd;
}

/**
 * Fetch current base fee + priority fee from a RPC as an ETH-denominated number.
 * RPC returns a hex string in wei; we use BigInt to avoid floating-point precision loss
 * during hex parsing, then convert to ETH (1 ETH = 1e18 wei).
 */
async function fetchGasPriceInETH(): Promise<number> {
  if (!ETHEREUM_RPC_URL) {
    throw new Error("ETH_RPC_URL is not set in the environment variables");
  }

  const response = await fetch(ETHEREUM_RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
  });
  const json = (await response.json()) as { result: Hex };
  const gasPriceWei = hexToBigInt(json.result);
  return Number(formatEther(gasPriceWei));
}

/**
 * Fetch live ETH/USD and gas price data.
 * Falls back to hardcoded defaults if any request fails.
 */
export async function fetchGasPrices(): Promise<IGasPrices> {
  const [ethInUsd, gasPriceInETH] = await Promise.all([
    fetchEthInUsd().catch(() => FALLBACK_ETH_USD),
    fetchGasPriceInETH().catch(() => FALLBACK_GAS_ETH_GWEI),
  ]);

  const date = new Date().toISOString().slice(0, 10);
  return { ethInUsd, gasPriceInETH, date };
}

/**
 * Build a human-readable ETH/USD cost note for a given gas amount.
 * Example: value: "~0.001234 ETH / ~$4.32, notes: ETH = $3,500 (2025-06-11)"
 * Remember that 1 x 10^9 gwei = 1 ETH
 * @param gasUnits the amount of gas used, as a number (e.g. 21000)
 * @param gasPrices the current gas prices to use for the calculation
 * @returns an object containing the formatted value and notes
 */
export function buildCostValueAndNotes(gasUnits: number, gasPrices: IGasPrices): IValueAndNotes {
  const ethCost = gasUnits * gasPrices.gasPriceInETH;
  const usdCost = ethCost * gasPrices.ethInUsd;

  const ethStr = ethCost.toFixed(6);
  const usdStr = usdCost.toFixed(2);

  const ethPriceStr = gasPrices.ethInUsd.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return {
    value: `~${ethStr} ETH / $${usdStr}`,
    notes: `Computed average with ETH = $${ethPriceStr} on ${gasPrices.date}. `,
  };
}

/**
 * Inserts or updates a property with the values and notes parameters
 * @param properties The properties array to update
 * @param name The name of the property to update or insert
 * @param value The value to set for the property
 * @param notes The notes to set for the property; if the property already exists, the new notes will be prepended to the existing notes
 */
export function upsertProperty(properties: Property[], name: string, value: string, notes: string) {
  const existing = properties.find((property) => property.name === name);

  if (existing) {
    existing.value = value;

    if (existing.notes) {
      const withGasPriceNotice = existing.notes.startsWith("Computed average with ETH = $");
      const existingNotes = withGasPriceNotice ? existing.notes.split(". ")[1] : existing.notes;

      existing.notes = notes + existingNotes;
      return;
    }

    existing.notes = notes;

    return;
  }

  properties.push({ name, value: value, notes });
}

/**
 * Syncs an operation's average gas usage to the properties array using the formatted value and notes.
 * @param properties The properties array to update
 * @param name The name of the property to update (e.g. "On-chain gas cost: deposit")
 * @param operation The operation stats containing totalGasUsed and totalCount
 * @param gasPrices Optional gas prices to calculate USD cost; if not provided, only average gas units will be saved
 */
export function syncOperation(
  properties: Property[],
  name: string,
  operation: IOperationStats,
  gasPrices?: IGasPrices,
) {
  const average = Number(operation.totalGasUsed) / Number(operation.totalCount);

  if (gasPrices) {
    const { value, notes } = buildCostValueAndNotes(average, gasPrices);
    upsertProperty(properties, name, value, notes);
  } else {
    upsertProperty(properties, name, String(average), "");
  }
}
