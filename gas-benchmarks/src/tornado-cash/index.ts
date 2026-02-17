import { getEventLogs, getMatchingTransactions, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics, saveGasMetrics } from "../utils/utils.js";

import {
  ENCRYPTED_NOTE_EVENT_ABI,
  MAX_OF_LOGS,
  SHIELD_TOPIC_FILTER,
  STAKE_BURNED_EVENT_ABI,
  TORNADO_CASH_RELAYER_REGISTRY,
  TORNADO_CASH_ROUTER,
  UNSHIELD_TOPIC_FILTER,
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
      event: ENCRYPTED_NOTE_EVENT_ABI,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getMatchingTransactions(uniqueLogs, SHIELD_TOPIC_FILTER);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "shield");
  }

  async benchmarkUnshield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: TORNADO_CASH_RELAYER_REGISTRY,
      event: STAKE_BURNED_EVENT_ABI,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getMatchingTransactions(uniqueLogs, UNSHIELD_TOPIC_FILTER);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "unshield");
  }
}
