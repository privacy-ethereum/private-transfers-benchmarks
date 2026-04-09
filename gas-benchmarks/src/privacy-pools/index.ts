import { mainnet } from "viem/chains";

import type { IAggregatedMetrics } from "./types.js";
import type { TransactionReceipt } from "viem";

import { MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  PRIVACY_POOLS_CONFIG,
  PRIVACY_POOLS_ENTRYPOINT_PROXY,
  SHIELD_ETH_EVENTS,
  UNSHIELD_ETH_EVENTS,
} from "./constants.js";

export class PrivacyPools {
  readonly name = PRIVACY_POOLS_CONFIG.name;

  readonly version = PRIVACY_POOLS_CONFIG.version;

  async benchmark(): Promise<IAggregatedMetrics> {
    const [shieldEthReceipts, unshieldEthReceipts] = await Promise.all([
      this.benchmarkShieldETH(),
      this.benchmarkUnshieldETH(),
    ]);

    return {
      shieldEth: getAverageMetrics(shieldEthReceipts),
      unshieldEth: getAverageMetrics(unshieldEthReceipts),
      anonymitySetSize: shieldEthReceipts.length - unshieldEthReceipts.length,
    };
  }

  private async benchmarkShieldETH(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY,
      events: SHIELD_ETH_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkUnshieldETH(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY,
      events: UNSHIELD_ETH_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }
}
