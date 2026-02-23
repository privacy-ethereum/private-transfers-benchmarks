import { mainnet, scroll } from "viem/chains";

import type { GasMetrics } from "../utils/types.js";

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
} from "./constants.js";

export class Intmax {
  readonly name = "intmax";

  readonly version = "1.0.0";

  async benchmark(): Promise<Record<string, GasMetrics>> {
    const [depositEth, withdrawEth] = await Promise.all([this.benchmarkDepositETH(), this.benchmarkWithdrawETH()]);

    return { depositEth, withdrawEth };
  }

  async benchmarkDepositETH(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: INTMAX_LIQUIDITY_PROXY,
      events: DEPOSIT_ETH_EVENTS,
      chain: mainnet,
      latestBlock: DEPOSIT_ETH_FROM_BLOCK,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} deposit ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkWithdrawETH(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: INTMAX_WITHDRAWAL_PROXY,
      events: WITHDRAW_ETH_EVENTS,
      chain: scroll,
      latestBlock: WITHDRAW_ETH_FROM_BLOCK,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} withdraw ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }
}
