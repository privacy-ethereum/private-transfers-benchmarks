import { getEventLogs, getTransactionsWithNEvents, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics, saveGasMetrics } from "../utils/utils.js";

import {
  MAX_OF_LOGS,
  NULLIFIED_EVENT_ABI,
  NUMBER_OF_SHIELD_EVENTS,
  NUMBER_OF_TRANSFER_EVENTS,
  NUMBER_OF_UNSHIELD_EVENTS,
  RAILGUN_SMART_WALLET_PROXY,
  SHIELD_EVENT_ABI,
  UNSHIELD_EVENT_ABI,
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

    const txs = await getTransactionsWithNEvents(uniqueLogs, NUMBER_OF_SHIELD_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No shield transactions found for ${this.name}.`);
    }

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

    const txs = await getTransactionsWithNEvents(uniqueLogs, NUMBER_OF_UNSHIELD_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No unshield transactions found for ${this.name}.`);
    }

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

    const txs = await getTransactionsWithNEvents(uniqueLogs, NUMBER_OF_TRANSFER_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No transfer transactions found for ${this.name}.`);
    }

    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "transfer");
  }
}
