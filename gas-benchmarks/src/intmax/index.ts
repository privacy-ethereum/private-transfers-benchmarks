import type { GasMetrics } from "../utils/types.js";

import { getEventLogs, getTransactionsWithEvents, getUniqueLogs, scrollPublicClient } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  DEPOSIT_ETH_FROM_BLOCK,
  WITHDRAW_ETH_FROM_BLOCK,
  INTMAX_LIQUIDITY_PROXY,
  INTMAX_WITHDRAWAL_PROXY,
  MAX_OF_LOGS,
  DEPOSIT_ETH_EVENTS,
  WITHDRAW_ETH_EVENTS,
} from "./constants.js";

export class Intmax {
  readonly name = "intmax";

  readonly version = "1.0.0";

  async benchmark(): Promise<Record<string, GasMetrics>> {
    const [depositEth, withdrawEth] = await Promise.all([this.benchmarkDepositETH(), this.benchmarkWithdrawETH()]);

    return { depositEth, withdrawEth };
  }

  async benchmarkDepositETH(): Promise<GasMetrics> {
    const logs = await getEventLogs({
      contractAddress: INTMAX_LIQUIDITY_PROXY,
      events: DEPOSIT_ETH_EVENTS,
      maxLogs: MAX_OF_LOGS,
      fromBlock: DEPOSIT_ETH_FROM_BLOCK,
    });
    const uniqueLogs = getUniqueLogs(logs);
    const txs = await getTransactionsWithEvents(uniqueLogs, DEPOSIT_ETH_EVENTS);

    if (txs.length === 0) {
      throw new Error(`No deposit ETH transactions found for ${this.name}.`);
    }

    return getAverageMetrics(txs);
  }

  async benchmarkWithdrawETH(): Promise<GasMetrics> {
    const logs = await getEventLogs({
      contractAddress: INTMAX_WITHDRAWAL_PROXY,
      events: WITHDRAW_ETH_EVENTS,
      maxLogs: MAX_OF_LOGS,
      fromBlock: WITHDRAW_ETH_FROM_BLOCK,
      client: scrollPublicClient,
    });
    const uniqueLogs = getUniqueLogs(logs);
    const txs = await getTransactionsWithEvents(uniqueLogs, WITHDRAW_ETH_EVENTS, scrollPublicClient);

    if (txs.length === 0) {
      throw new Error(`No withdraw ETH transactions found for ${this.name}.`);
    }

    return getAverageMetrics(txs);
  }
}
