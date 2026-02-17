import type { AbiEvent, Address, Hex } from "viem";

export interface GasMetrics {
  averageGasUsed: bigint | "no-data";
  averageGasPrice: bigint | "no-data";
  averageTxFee: bigint | "no-data";
}

export interface GetShieldEventLogs {
  contractAddress: Hex;
  event: AbiEvent;
  maxLogs: number;
}

/**
 * A single topic filter entry: matches a log whose `address` equals
 * `contractAddress` and whose first topic (`topics[0]`) equals `topic`.
 */
export interface TopicEntry {
  contractAddress: Address;
  topic: Hex;
}

/**
 * Configuration for topic-based receipt filtering.
 * A receipt passes when:
 *   1. Every entry in `required` matches at least one log in the receipt.
 *   2. No entry in `forbidden` matches any log in the receipt.
 */
export interface TopicFilterConfig {
  required: TopicEntry[];
  forbidden: TopicEntry[];
}
