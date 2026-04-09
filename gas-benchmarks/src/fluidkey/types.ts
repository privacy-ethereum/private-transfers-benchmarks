import type { FeeMetrics } from "../utils/types.js";

/**
 * Interface representing the aggregated metrics
 */
export interface IAggregatedMetrics {
  /**
   * The average fee metrics for the shield ETH operation, including average gas used, average gas price, and average transaction fee.
   */
  shieldEth: FeeMetrics;

  /**
   * The average fee metrics for the shield ERC20 operation, including average gas used, average gas price, and average transaction fee.
   */
  shieldErc20: FeeMetrics;

  /**
   * The average fee metrics for the transfer ETH operation, including average gas used, average gas price, and average transaction fee.
   */
  transferEth: FeeMetrics;

  /**
   * The average fee metrics for the transfer ERC20 operation, including average gas used, average gas price, and average transaction fee.
   */
  transferErc20: FeeMetrics;

  /**
   * The size of the anonymity set by native and ERC20 tokens, which represents the number of transactions that are indistinguishable from each other in terms of privacy.
   */
  anonymitySetSize: Record<string, bigint | number>;
}
