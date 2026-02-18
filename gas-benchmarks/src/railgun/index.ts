import type { GasMetrics } from "../utils/types.js";

import { getEventLogs, getTransactionsWithEvents, getUniqueLogs } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

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

  async benchmark(): Promise<Record<string, GasMetrics>> {
    const [shieldErc20, unshieldErc20, transferErc20] = await Promise.all([
      this.benchmarkShieldERC20(),
      this.benchmarkUnshieldERC20(),
      this.benchmarkTransferERC20(),
    ]);

    return { shieldErc20, unshieldErc20, transferErc20 };
  }

  async benchmarkShieldERC20(): Promise<GasMetrics> {
    const logs = await getEventLogs({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      events: SHIELD_ERC20_EVENTS,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);
    const txs = await getTransactionsWithEvents(uniqueLogs, SHIELD_ERC20_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No shield ERC20 transactions found for ${this.name}.`);
    }

    return getAverageMetrics(txs);
  }

  async benchmarkUnshieldERC20(): Promise<GasMetrics> {
    const logs = await getEventLogs({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      events: UNSHIELD_ERC20_EVENTS,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);
    const txs = await getTransactionsWithEvents(uniqueLogs, UNSHIELD_ERC20_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No unshield ERC20 transactions found for ${this.name}.`);
    }

    return getAverageMetrics(txs);
  }

  async benchmarkTransferERC20(): Promise<GasMetrics> {
    const logs = await getEventLogs({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      events: TRANSFER_ERC20_EVENTS,
      maxLogs: MAX_OF_LOGS,
    });
    const uniqueLogs = getUniqueLogs(logs);
    const txs = await getTransactionsWithEvents(uniqueLogs, TRANSFER_ERC20_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No transfer ERC20 transactions found for ${this.name}.`);
    }

    return getAverageMetrics(txs);
  }
}
