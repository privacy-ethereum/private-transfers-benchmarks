import { getEventLogs, getMatchingTransactions, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics, saveGasMetrics } from "../utils/utils.js";

import {
  DEPOSITED_EVENT_ABI,
  MAX_OF_LOGS,
  PRIVACY_POOLS_ENTRYPOINT_PROXY,
  SHIELD_TOPIC_FILTER,
  UNSHIELD_TOPIC_FILTER,
  WITHDRAWAL_RELAYED_EVENT_ABI,
} from "./constants.js";

export class PrivacyPools {
  readonly name = "privacy-pools";

  readonly version = "1.1.1";

  async benchmark(): Promise<void> {
    await this.benchmarkShield();
    await this.benchmarkUnshield();
  }

  async benchmarkShield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY,
      event: DEPOSITED_EVENT_ABI,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getMatchingTransactions(uniqueLogs, SHIELD_TOPIC_FILTER);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "shield");
  }

  async benchmarkUnshield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY,
      event: WITHDRAWAL_RELAYED_EVENT_ABI,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getMatchingTransactions(uniqueLogs, UNSHIELD_TOPIC_FILTER);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "unshield");
  }
}
