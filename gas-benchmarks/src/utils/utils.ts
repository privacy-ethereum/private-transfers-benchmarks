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

/**
 * Determines if a transaction receipt represents a native ETH transfer
 * @param receipt - The transaction receipt to check
 * @returns A boolean indicating whether the receipt represents a native ETH transfer
 */
export const isNativeTransfer = (receipt: TransactionReceipt): boolean => {
  const isGasUsed21000 = receipt.gasUsed === 21000n;
  const hasNoLogs = receipt.logs.length === 0;
  const isNotContractDeployment = receipt.contractAddress === null;
  const hasRecipient = receipt.to !== null; // ensures it's not a contract creation transaction

  return isGasUsed21000 && hasNoLogs && isNotContractDeployment && hasRecipient;
};
