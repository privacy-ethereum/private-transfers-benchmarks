import type { FeeMetrics } from "../utils/types.js";

import { MIN_SAMPLES } from "../utils/constants.js";

import { getMoneroMetrics, getOneInputTwoOutputsTransactions } from "./utils.js";

export class Monero {
  readonly name = "monero";

  /**
   * The version number refers to a Monero node version.
   * Most of the alt-L1s only have one node implementation, so use that as a version.
   * https://github.com/monero-project/monero/releases/tag/v0.18.4.6
   */
  readonly version = "0.18.4.6";

  async benchmark(): Promise<Record<string, FeeMetrics>> {
    const transfer = await this.benchmarkTransfer();

    return { transfer };
  }

  async benchmarkTransfer(): Promise<FeeMetrics> {
    const transactions = await getOneInputTwoOutputsTransactions();

    if (transactions.length < MIN_SAMPLES) {
      throw new Error(`${this.name} transactions (${transactions.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getMoneroMetrics(transactions);
  }
}
