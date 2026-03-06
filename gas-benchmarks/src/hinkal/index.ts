import { mainnet } from "viem/chains";

import type { GasMetrics } from "../utils/types.js";

import { MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import { HINKAL_POOL, SHIELD_ERC20_EVENTS, TRANSFER_ERC20_EVENTS, UNSHIELD_ERC20_EVENTS } from "./constants.js";

export class Hinkal {
  readonly name = "hinkal";

  readonly version = "1.0.0";

  async benchmark(): Promise<Record<string, GasMetrics>> {
    const [shieldErc20, unshieldErc20, transferErc20] = await Promise.all([
      this.benchmarkShieldERC20(),
      this.benchmarkUnshieldERC20(),
      this.benchmarkTransferERC20(),
    ]);

    return { shieldErc20, unshieldErc20, transferErc20 };
  }

  async benchmarkShieldERC20(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: SHIELD_ERC20_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkUnshieldERC20(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: UNSHIELD_ERC20_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkTransferERC20(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: TRANSFER_ERC20_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} transfer ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }
}
