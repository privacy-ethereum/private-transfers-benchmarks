import type { IAggregatedMetrics } from "./types.js";

import { MIN_SAMPLES } from "../utils/constants.js";

import { getMoneroMetrics, getOneInputTwoOutputsTransactions, type MoneroTransaction } from "./utils.js";

export class Monero {
  readonly name = "monero";

  /**
   * The version number refers to a Monero node version.
   * Most of the alt-L1s only have one node implementation, so use that as a version.
   * https://github.com/monero-project/monero/releases/tag/v0.18.4.6
   */
  readonly version = "0.18.4.6";

  async benchmark(): Promise<IAggregatedMetrics> {
    const transactions = await this.benchmarkTransfer();

    return { transfer: getMoneroMetrics(transactions), anonymitySetSize: transactions.length };
  }

  private async benchmarkTransfer(): Promise<MoneroTransaction[]> {
    const transactions = await getOneInputTwoOutputsTransactions();

    if (transactions.length < MIN_SAMPLES) {
      throw new Error(`${this.name} transactions (${transactions.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return transactions;
  }
}
