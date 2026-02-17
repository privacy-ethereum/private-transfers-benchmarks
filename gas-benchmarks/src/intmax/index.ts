import { getEventLogs, getTransactionsWithEvents, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics, saveGasMetrics } from "../utils/utils.js";

import { INTMAX_LIQUIDITY, MAX_OF_LOGS, SHIELD_ETH_EVENTS, UNSHIELD_ETH_EVENTS } from "./constants.js";

export class IntmaxV2 {
  readonly name = "intmax";

  readonly version = "2.0";

  async benchmark(): Promise<void> {
    await this.benchmarkShield();
    await this.benchmarkUnshield();
  }

  async benchmarkShield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: INTMAX_LIQUIDITY,
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
      contractAddress: INTMAX_LIQUIDITY,
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
