import { mainnet } from "viem/chains";

import type { FeeMetrics } from "../utils/types.js";

import { BLOCK_WINDOW_ETHEREUM_5_WEEKS, MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  HINKAL_POOL,
  SHIELD_ERC20_EVENTS,
  SHIELD_ETH_EVENTS,
  INTERNAL_TRANSFER_EVENTS,
  UNSHIELD_ERC20_EVENTS,
  UNSHIELD_ETH_EVENTS,
} from "./constants.js";

export class Hinkal {
  readonly name = "hinkal";

  readonly version = "1.0.0";

  async benchmark(): Promise<Record<string, FeeMetrics>> {
    const [shieldEth, unshieldEth, internalTransfer, shieldErc20, unshieldErc20] = await Promise.all([
      this.benchmarkShieldETH(),
      this.benchmarkUnshieldETH(),
      this.benchmarkInternalTransfer(),
      this.benchmarkShieldERC20(),
      this.benchmarkUnshieldERC20(),
    ]);

    return { shieldEth, unshieldEth, internalTransfer, shieldErc20, unshieldErc20 };
  }

  async benchmarkShieldETH(): Promise<FeeMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: SHIELD_ETH_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkUnshieldETH(): Promise<FeeMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: UNSHIELD_ETH_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkInternalTransfer(): Promise<FeeMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: INTERNAL_TRANSFER_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} internal transfer: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkShieldERC20(): Promise<FeeMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: SHIELD_ERC20_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkUnshieldERC20(): Promise<FeeMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: UNSHIELD_ERC20_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }
}
