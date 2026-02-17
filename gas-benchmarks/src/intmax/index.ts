import { getEventLogs, getTransactionsWithNEvents, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics, saveGasMetrics } from "../utils/utils.js";

import {
  DEPOSITED_EVENT_ABI,
  DIRECT_WITHDRAWAL_SUCCESSED_EVENT_ABI,
  INTMAX_LIQUIDITY,
  MAX_OF_LOGS,
  NUMBER_OF_SHIELD_EVENTS,
  NUMBER_OF_UNSHIELD_EVENTS,
} from "./constants.js";

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
      event: DEPOSITED_EVENT_ABI,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getTransactionsWithNEvents(uniqueLogs, NUMBER_OF_SHIELD_EVENTS);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "shield");
  }

  async benchmarkUnshield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: INTMAX_LIQUIDITY,
      event: DIRECT_WITHDRAWAL_SUCCESSED_EVENT_ABI,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getTransactionsWithNEvents(uniqueLogs, NUMBER_OF_UNSHIELD_EVENTS);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "unshield");
  }
}
