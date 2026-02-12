import type { AbiEvent, Hex } from "viem";

export interface GasMetrics {
  averageGasUsed: bigint | "no-data";
  averageGasPrice: bigint | "no-data";
  averageTxFee: bigint | "no-data";
}

export interface GetEventLogs {
  contractAddress: Hex;
  event: AbiEvent;
  maxLogs: number;
}
