import { mainnet } from "viem/chains";

import type { IAggregatedMetrics } from "./types.js";
import type { TransactionReceipt } from "viem";

import { MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  SHIELD_ETH_EVENTS,
  TORNADO_CASH_CONFIG,
  TORNADO_CASH_RELAYER_REGISTRY,
  TORNADO_CASH_ROUTER,
  UNSHIELD_ETH_EVENTS,
} from "./constants.js";

export class TornadoCash {
  readonly name = TORNADO_CASH_CONFIG.name;

  readonly version = TORNADO_CASH_CONFIG.version;

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
      contractAddress: TORNADO_CASH_ROUTER,
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
      contractAddress: TORNADO_CASH_RELAYER_REGISTRY,
      events: UNSHIELD_ETH_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }
}
