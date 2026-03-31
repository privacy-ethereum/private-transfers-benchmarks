import type { FeeMetrics } from "./types.js";
import type { TransactionReceipt } from "viem";

export const getAverageMetrics = (txs: TransactionReceipt[]): FeeMetrics => {
  const length = BigInt(txs.length);

  if (length === 0n) {
    return {
      averageGasUsed: "no-data",
      averageGasPrice: "no-data",
      averageTxFee: "no-data",
    };
  }

  const averageGasUsed = txs.reduce((sum, tx) => sum + tx.gasUsed, 0n) / length;
  const averageGasPrice = txs.reduce((sum, tx) => sum + tx.effectiveGasPrice, 0n) / length;
  const averageTxFee = txs.reduce((sum, tx) => sum + tx.gasUsed * tx.effectiveGasPrice, 0n) / length;

  return { averageGasUsed, averageGasPrice, averageTxFee };
};
