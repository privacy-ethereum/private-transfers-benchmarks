import { getEventLogs, getTransactionsWithNEvents, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics, saveGasMetrics } from "../utils/utils.js";

import {
  DEPOSITED_EVENT_ABI,
  MAX_OF_LOGS,
  NUMBER_OF_SHIELD_EVENTS,
  PRIVACY_POOLS_ENTRYPOINT_PROXY,
} from "./constants.js";

export class PrivacyPools {
  readonly name = "privacy-pools";

  readonly version = "1.1.1";

  async benchmark(): Promise<void> {
    await this.benchmarkShield();
  }

  async benchmarkShield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY,
      event: DEPOSITED_EVENT_ABI,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getTransactionsWithNEvents(uniqueLogs, NUMBER_OF_SHIELD_EVENTS);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "shield");
  }
}
