import { getEventLogs, getTransactionsWithEvents, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics, saveGasMetrics } from "../utils/utils.js";

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

  async benchmark(): Promise<void> {
    await this.benchmarkShield();
    await this.benchmarkUnshield();
  }

  async benchmarkShield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: TORNADO_CASH_ROUTER,
      event: SHIELD_ETH_EVENTS.at(-1)!,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getTransactionsWithEvents(uniqueLogs, SHIELD_ETH_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No shield transactions found for ${this.name}.`);
    }

    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "shield_eth");
  }

  async benchmarkUnshield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: TORNADO_CASH_RELAYER_REGISTRY,
      event: UNSHIELD_ETH_EVENTS[0],
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getTransactionsWithEvents(uniqueLogs, UNSHIELD_ETH_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No unshield transactions found for ${this.name}.`);
    }

    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "unshield_eth");
  }
}
