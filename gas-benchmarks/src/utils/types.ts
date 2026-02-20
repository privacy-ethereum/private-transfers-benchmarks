import type { AbiEvent, Hex, PublicClient } from "viem";

export interface GasMetrics {
  averageGasUsed: bigint | "no-data";
  averageGasPrice: bigint | "no-data";
  averageTxFee: bigint | "no-data";
}

export interface GetEventLogs {
  contractAddress: Hex;
  events: readonly AbiEvent[];
  maxLogs: number;
  fromBlock?: bigint;
  client?: PublicClient;
}

export type BenchmarkDb = Record<string, Record<string, GasMetrics | undefined>>;
