import { getEventLogs, getTransactionsWithNEvents, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics, saveGasMetrics } from "../utils/utils.js";

import {
  ENCRYPTED_NOTE_EVENT_ABI,
  MAX_OF_LOGS,
  NUMBER_OF_SHIELD_EVENTS,
  NUMBER_OF_UNSHIELD_EVENTS,
  STAKE_BURNED_EVENT_ABI,
  TORNADO_CASH_RELAYER_REGISTRY,
  TORNADO_CASH_ROUTER,
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

    const txs = await getTransactionsWithNEvents(uniqueLogs, NUMBER_OF_SHIELD_EVENTS);
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

    const txs = await getTransactionsWithNEvents(uniqueLogs, NUMBER_OF_UNSHIELD_EVENTS);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "unshield");
  }
}
