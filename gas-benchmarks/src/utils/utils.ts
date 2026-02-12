import { readFile, writeFile } from "node:fs/promises";

import type { GasMetrics } from "./types.js";
import type { TransactionReceipt } from "viem";

import { BENCHMARKS_OUTPUT_PATH, BLOCK_RANGE } from "./constants.js";

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

  return {
    averageGasUsed,
    averageGasPrice,
    averageTxFee,
  };
};

const serializeBigInt = (_key: string, value: unknown): unknown =>
  typeof value === "bigint" ? `${value.toString()}n` : value;

const deserializeBigInt = (_key: string, value: unknown): unknown => {
  if (typeof value === "string" && /^\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1));
  }
  return value;
};

export const getBenchmarksFromFile = async (): Promise<Record<string, Record<string, GasMetrics>>> => {
  try {
    const data = await readFile(BENCHMARKS_OUTPUT_PATH, "utf-8");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(data, deserializeBigInt) || {};
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw error;
  }
};

export const saveGasMetrics = async (metrics: GasMetrics, protocolName: string, methodName: string): Promise<void> => {
  const benchmarks = await getBenchmarksFromFile();

  const protocolBenchmarks = benchmarks[protocolName] || {};
  protocolBenchmarks[methodName] = metrics;
  benchmarks[protocolName] = protocolBenchmarks;

  const serialized = JSON.stringify(benchmarks, serializeBigInt, 2);
  await writeFile(BENCHMARKS_OUTPUT_PATH, `${serialized}\n`);
};
