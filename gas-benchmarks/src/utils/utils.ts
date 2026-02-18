import type { GasMetrics } from "./types.js";
import type { TransactionReceipt } from "viem";

import { BLOCK_RANGE } from "./constants.js";

export const getBlockInRange = (block: bigint): bigint => (block > BLOCK_RANGE ? block - BLOCK_RANGE + 1n : 0n);

export const getAverageMetrics = (txs: TransactionReceipt[]): GasMetrics => {
  if (txs.length === 0) {
    return {
      averageGasUsed: "no-data",
      averageGasPrice: "no-data",
      averageTxFee: "no-data",
    };
  }

  const averageGasUsed = txs.reduce((acc, tx) => acc + tx.gasUsed, 0n) / BigInt(txs.length);
  const averageGasPrice = txs.reduce((acc, tx) => acc + tx.effectiveGasPrice, 0n) / BigInt(txs.length);
  const averageTxFee = txs.reduce((acc, tx) => acc + tx.gasUsed * tx.effectiveGasPrice, 0n) / BigInt(txs.length);

  return { averageGasUsed, averageGasPrice, averageTxFee };
};
