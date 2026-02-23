import { Low } from "lowdb";

import { readFile, writeFile } from "node:fs/promises";

import type { GasMetrics } from "./types.js";

import { BENCHMARKS_OUTPUT_PATH } from "./constants.js";

type BenchmarkDb = Record<string, Record<string, GasMetrics | undefined>>;

const serializeBigInt = (_key: string, value: unknown) => (typeof value === "bigint" ? `${value.toString()}n` : value);

const deserializeBigInt = (_key: string, value: unknown) => {
  if (typeof value === "string" && /^\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1));
  }
  return value;
};

export const db = new Low<BenchmarkDb>(
  {
    read: async () => {
      try {
        return JSON.parse(await readFile(BENCHMARKS_OUTPUT_PATH, "utf-8"), deserializeBigInt) as BenchmarkDb;
      } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code === "ENOENT") {
          return {};
        }
        throw error;
      }
    },
    write: async (data) => {
      await writeFile(BENCHMARKS_OUTPUT_PATH, `${JSON.stringify(data, serializeBigInt, 2)}\n`);
    },
  },
  {},
);
