export interface GasMetrics {
  averageGasUsed: bigint | "no-data";
  averageGasPrice: bigint | "no-data";
  averageTxFee: bigint | "no-data";
}
