import { mainnet } from "viem/chains";

import type { GasMetrics } from "../utils/types.js";

import { MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import { PRIVACY_POOLS_ENTRYPOINT_PROXY, SHIELD_ETH_EVENTS, UNSHIELD_ETH_EVENTS } from "./constants.js";

export class PrivacyPools {
  readonly name = "privacy-pools";

  readonly version = "1.1.1";

  async benchmark(): Promise<Record<string, GasMetrics>> {
    const [shieldEth, unshieldEth] = await Promise.all([this.benchmarkShieldETH(), this.benchmarkUnshieldETH()]);

    return { shieldEth, unshieldEth };
  }

  async benchmarkShieldETH(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY,
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
      contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY,
      events: UNSHIELD_ETH_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }
}
