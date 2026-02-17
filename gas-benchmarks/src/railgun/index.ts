import { getEventLogs, getMatchingTransactions, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics, saveGasMetrics } from "../utils/utils.js";

import {
  MAX_OF_LOGS,
  NULLIFIED_EVENT_ABI,
  RAILGUN_SMART_WALLET_PROXY,
  SHIELD_EVENT_ABI,
  SHIELD_TOPIC_FILTER,
  TRANSFER_TOPIC_FILTER,
  UNSHIELD_EVENT_ABI,
  UNSHIELD_TOPIC_FILTER,
} from "./constants.js";

export class Railgun {
  readonly name = "railgun";

  readonly version = "0.0.1";

  async benchmark(): Promise<void> {
    await this.benchmarkShield();
    await this.benchmarkUnshield();
    await this.benchmarkTransfer();
  }

  async benchmarkShield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      event: SHIELD_EVENT_ABI,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getMatchingTransactions(uniqueLogs, SHIELD_TOPIC_FILTER);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "shield");
  }

  async benchmarkUnshield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      event: UNSHIELD_EVENT_ABI,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getMatchingTransactions(uniqueLogs, UNSHIELD_TOPIC_FILTER);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "unshield");
  }

  async benchmarkTransfer(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      event: NULLIFIED_EVENT_ABI,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getMatchingTransactions(uniqueLogs, TRANSFER_TOPIC_FILTER);
    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "transfer");
  }
}
