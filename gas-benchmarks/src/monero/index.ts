import type { IBenchmarkDb } from "../utils/db.js";
import type { FeeMetrics } from "../utils/types.js";

import { MIN_SAMPLES } from "../utils/constants.js";

import { getMoneroMetrics, getOneInputTwoOutputsTransactions } from "./utils.js";

export class Monero {
  readonly name = "monero";

  async benchmark(): Promise<IBenchmarkDb["monero"]> {
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
