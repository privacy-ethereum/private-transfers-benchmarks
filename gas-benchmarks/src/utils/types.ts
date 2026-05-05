import type { AbiEvent, Address } from "viem";

/** A contract address with a link to its source code */
export interface ContractAddress {
  address: Address;
  sourceUrl: `https://${string}.sol${string}`;
}

/**
 * URL pointing to a `.sol` source file with a line reference.
 * Supports hash anchors (#L123), query params (?start=30), and encoded .sol in query strings.
 */
type SolSourceUrl =
  | `https://${string}.sol#L${number}`
  | `https://${string}.sol?${string}start=${number}`
  | `https://${string}?${string}.sol${string}start=${number}`;

/**
 * A contract operation (e.g. shield, unshield, transfer)
 * Enforce `.sol` line reference, at least one event, and block explorer tx URL structure
 */
export interface Operation {
  functionSourceUrl: SolSourceUrl;
  exampleTxUrl: `https://${string}scan.${string}/tx/0x${string}`;
  events: readonly [AbiEvent, ...AbiEvent[]];
}

/**
 * Protocol configuration.
 * Enforce at least 1 contract and 2 operations per protocol
 */
export interface ProtocolConfig {
  name: string;
  version: string;
  contracts: [ContractAddress, ...ContractAddress[]];
  operations: [Operation, Operation, ...Operation[]];
}

/** Fee metrics */
export interface FeeMetrics {
  averageGasUsed: bigint | number | "no-data";
  averageGasPrice?: bigint | number | "no-data";
  averageTxFee?: bigint | number | "no-data";
}
