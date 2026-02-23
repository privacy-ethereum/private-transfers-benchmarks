import { mainnet } from "viem/chains";

import type { GasMetrics } from "../utils/types.js";

import { MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  SHIELD_ETH_EVENTS,
  TORNADO_CASH_RELAYER_REGISTRY,
  TORNADO_CASH_ROUTER,
  UNSHIELD_ETH_EVENTS,
} from "./constants.js";

export class TornadoCash {
  readonly name = "tornado-cash";

  readonly version = "unstoppable-release";

  async benchmark(): Promise<Record<string, GasMetrics>> {
    const [shieldEth, unshieldEth] = await Promise.all([this.benchmarkShieldETH(), this.benchmarkUnshieldETH()]);

    return { shieldEth, unshieldEth };
  }

  async benchmarkShieldETH(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: TORNADO_CASH_ROUTER,
      events: SHIELD_ETH_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkUnshieldETH(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: TORNADO_CASH_RELAYER_REGISTRY,
      events: UNSHIELD_ETH_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }
}
