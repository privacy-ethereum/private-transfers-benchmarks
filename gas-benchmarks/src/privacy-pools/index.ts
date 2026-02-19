import type { GasMetrics } from "../utils/types.js";

import { getEventLogs, getTransactionsWithEvents, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import { MAX_OF_LOGS, PRIVACY_POOLS_ENTRYPOINT_PROXY, SHIELD_ETH_EVENTS, UNSHIELD_ETH_EVENTS } from "./constants.js";

export class PrivacyPools {
  readonly name = "privacy-pools";

  readonly version = "1.1.1";

  async benchmark(): Promise<Record<string, GasMetrics>> {
    const [shieldEth, unshieldEth] = await Promise.all([this.benchmarkShieldETH(), this.benchmarkUnshieldETH()]);

    return { shieldEth, unshieldEth };
  }

  async benchmarkShieldETH(): Promise<GasMetrics> {
    const logs = await getEventLogs({
      contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY,
      events: SHIELD_ETH_EVENTS,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);
    const txs = await getTransactionsWithEvents(uniqueLogs, SHIELD_ETH_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No shield ETH transactions found for ${this.name}.`);
    }

    return getAverageMetrics(txs);
  }

  async benchmarkUnshieldETH(): Promise<GasMetrics> {
    const logs = await getEventLogs({
      contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY,
      events: UNSHIELD_ETH_EVENTS,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);
    const txs = await getTransactionsWithEvents(uniqueLogs, UNSHIELD_ETH_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No unshield ETH transactions found for ${this.name}.`);
    }

    return getAverageMetrics(txs);
  }
}
