import { mainnet, scroll } from "viem/chains";

import type { IAggregatedMetrics } from "./types.js";
import type { TransactionReceipt } from "viem";

import { MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  DEPOSIT_ETH_FROM_BLOCK,
  WITHDRAW_ETH_FROM_BLOCK,
  INTMAX_LIQUIDITY_PROXY,
  INTMAX_WITHDRAWAL_PROXY,
  DEPOSIT_ETH_EVENTS,
  WITHDRAW_ETH_EVENTS,
  INTMAX_CONFIG,
} from "./constants.js";

export class Intmax {
  readonly name = INTMAX_CONFIG.name;

  readonly version = INTMAX_CONFIG.version;

  async benchmark(): Promise<IAggregatedMetrics> {
    const [depositEthReceipts, withdrawEthReceipts] = await Promise.all([
      this.benchmarkDepositETH(),
      this.benchmarkWithdrawETH(),
    ]);

    return {
      depositEth: getAverageMetrics(depositEthReceipts),
      withdrawEth: getAverageMetrics(withdrawEthReceipts),
      anonymitySetSize: depositEthReceipts.length - withdrawEthReceipts.length,
    };
  }

  private async benchmarkDepositETH(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: INTMAX_LIQUIDITY_PROXY,
      events: DEPOSIT_ETH_EVENTS,
      chain: mainnet,
      latestBlock: DEPOSIT_ETH_FROM_BLOCK,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} deposit ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkWithdrawETH(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: INTMAX_WITHDRAWAL_PROXY,
      events: WITHDRAW_ETH_EVENTS,
      chain: scroll,
      latestBlock: WITHDRAW_ETH_FROM_BLOCK,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} withdraw ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }
}
