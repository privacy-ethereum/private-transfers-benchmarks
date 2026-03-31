export interface FeeMetrics {
  averageGasUsed: bigint | number | "no-data";
  averageGasPrice: bigint | number | "no-data";
  averageTxFee: bigint | number | "no-data";
}
