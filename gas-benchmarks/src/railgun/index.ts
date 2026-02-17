import { getEventLogs, getTransactionsWithEvents, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics, saveGasMetrics } from "../utils/utils.js";

import {
  MAX_OF_LOGS,
  RAILGUN_SMART_WALLET_PROXY,
  SHIELD_ERC20_EVENTS,
  TRANSFER_ERC20_EVENTS,
  UNSHIELD_ERC20_EVENTS,
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
      event: SHIELD_ERC20_EVENTS.at(-1)!,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getTransactionsWithEvents(uniqueLogs, SHIELD_ERC20_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No shield transactions found for ${this.name}.`);
    }

    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "shield_erc20");
  }

  async benchmarkUnshield(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      event: UNSHIELD_ERC20_EVENTS.at(-1)!,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getTransactionsWithEvents(uniqueLogs, UNSHIELD_ERC20_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No unshield transactions found for ${this.name}.`);
    }

    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "unshield_erc20");
  }

  async benchmarkTransfer(): Promise<void> {
    const logs = await getEventLogs({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      event: TRANSFER_ERC20_EVENTS[0],
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);

    const txs = await getTransactionsWithEvents(uniqueLogs, TRANSFER_ERC20_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No transfer transactions found for ${this.name}.`);
    }

    const metrics = getAverageMetrics(txs);

    await saveGasMetrics(metrics, `${this.name}_${this.version}`, "transfer_erc20");
  }
}
