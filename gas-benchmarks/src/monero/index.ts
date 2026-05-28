import type { IBenchmarkDb } from "../utils/db.js";

import { getMoneroMetrics, getOneInputTwoOutputsTransactions } from "./utils.js";

export class Monero {
  async benchmark(): Promise<IBenchmarkDb["monero"]> {
    const transactions = await getOneInputTwoOutputsTransactions();
    const transfer = getMoneroMetrics(transactions);

    return { transfer };
  }
}
