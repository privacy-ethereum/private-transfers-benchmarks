import type { GasMetrics } from "../utils/types.js";

import { getEventLogs, getTransactionsWithEvents, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  MAX_OF_LOGS,
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
    const logs = await getEventLogs({
      contractAddress: TORNADO_CASH_ROUTER,
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
      contractAddress: TORNADO_CASH_RELAYER_REGISTRY,
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
