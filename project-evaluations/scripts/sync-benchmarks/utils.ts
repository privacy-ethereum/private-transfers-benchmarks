import { type Property } from "../../src/types";
import {
  ARB_RPC_URL,
  BASE_RPC_URL,
  ETH_PRICE_IN_USD_API_URL,
  ETH_RPC_URL,
  FALLBACK_ETH_USD,
  FALLBACK_GAS_ETH_ARBITRUM,
  FALLBACK_GAS_ETH_BASE,
  FALLBACK_GAS_ETH_MAINNET,
  FALLBACK_GAS_ETH_SCROLL,
  FALLBACK_GAS_ETH_SEPOLIA,
  FALLBACK_GAS_ETH_STARKNET,
  SCROLL_RPC_URL,
  SEPOLIA_RPC_URL,
  STARKNET_RPC_URL,
} from "./constants";
import { Network } from "./enums";
import { type IValueAndNotes, type IGasPrices, type IOperationStats } from "./interfaces";
import { formatEther, type Hex, hexToBigInt } from "viem";

/** Fetch current ETH/USD price from external API*/
async function fetchEthInUsd(): Promise<number> {
  const response = await fetch(ETH_PRICE_IN_USD_API_URL);
  const json = (await response.json()) as { ethereum: { usd: number } };
  return json.ethereum.usd;
}

/**
 * Fetch current base fee + priority fee from a RPC as wei
 * RPC returns a hex string in wei; we use BigInt to avoid floating-point precision loss
 */
async function fetchGasPriceInETH(rpc: string): Promise<bigint> {
  const response = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
  });
  const json = (await response.json()) as { result: Hex };
  const gasPriceWei = hexToBigInt(json.result);
  return gasPriceWei;
}

/**
 * Fetch live ETH/USD and gas price data.
 * Falls back to hardcoded defaults if any request fails.
 */
export async function fetchGasPrices(): Promise<IGasPrices> {
  const [
    ethInUsd,
    gasPriceInETHMainnet,
    gasPriceInETHArbitrum,
    gasPriceInETHSepolia,
    gasPriceInETHBase,
    gasPriceInETHScroll,
    gasPriceInETHStarknet,
  ] = await Promise.all([
    fetchEthInUsd().catch(() => FALLBACK_ETH_USD),
    fetchGasPriceInETH(ETH_RPC_URL).catch(() => FALLBACK_GAS_ETH_MAINNET),
    fetchGasPriceInETH(ARB_RPC_URL).catch(() => FALLBACK_GAS_ETH_ARBITRUM),
    fetchGasPriceInETH(SEPOLIA_RPC_URL).catch(() => FALLBACK_GAS_ETH_SEPOLIA),
    fetchGasPriceInETH(BASE_RPC_URL).catch(() => FALLBACK_GAS_ETH_BASE),
    fetchGasPriceInETH(SCROLL_RPC_URL).catch(() => FALLBACK_GAS_ETH_SCROLL),
    fetchGasPriceInETH(STARKNET_RPC_URL).catch(() => FALLBACK_GAS_ETH_STARKNET),
  ]);

  const date = new Date().toISOString().slice(0, 10);

  const inETH = {
    [Network.MAINNET]: gasPriceInETHMainnet,
    [Network.ARBITRUM]: gasPriceInETHArbitrum,
    [Network.SEPOLIA]: gasPriceInETHSepolia,
    [Network.BASE]: gasPriceInETHBase,
    [Network.SCROLL]: gasPriceInETHScroll,
    [Network.STARKNET]: gasPriceInETHStarknet,
  };

  return { ethInUsd, inETH, date };
}

/**
 * Build a human-readable ETH/USD cost note for a given gas amount.
 * Example: value: "~0.001234 ETH / ~$4.32, notes: ETH = $3,500 (2025-06-11)"
 * Remember that 1 x 10^9 gwei = 1 ETH
 * @param gasUnits the amount of gas used, as a number (e.g. 21000)
 * @param gasPrices the current gas prices to use for the calculation
 * @returns an object containing the formatted value and notes
 */
export function buildCostValueAndNotes(
  gasUnits: number,
  gasPrices: IGasPrices,
  network: Network = Network.MAINNET,
): IValueAndNotes {
  const ethCostInWei = BigInt(Math.trunc(gasUnits)) * gasPrices.inETH[network];
  const ethCost = Number(formatEther(ethCostInWei));
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
  network?: Network,
  gasPrices?: IGasPrices,
) {
  const average = Number(operation.totalGasUsed) / Number(operation.totalCount);

  if (gasPrices) {
    const { value, notes } = buildCostValueAndNotes(average, gasPrices, network);
    upsertProperty(properties, name, value, notes);
  } else {
    upsertProperty(properties, name, String(average), "");
  }
}
