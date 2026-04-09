import type { FeeMetrics } from "../utils/types.js";

/**
 * Interface representing the aggregated metrics
 */
export interface IAggregatedMetrics {
  /**
   * The average fee metrics for the transfer operation, including average gas used, average gas price, and average transaction fee.
   */
  transfer: FeeMetrics;

  /**
   * The size of the anonymity set, which represents the number of transactions that are indistinguishable from each other in terms of privacy.
   */
  anonymitySetSize: bigint | number;
}
