import { Low } from "lowdb";

import { readFile, writeFile } from "node:fs/promises";

import type { FeeMetrics } from "./types.js";
import type { TMainnetRootQuery } from "../subgraph/mainnet.js";
import type { TSepoliaRootQuery } from "../subgraph/sepolia.js";

import { BENCHMARKS_OUTPUT_PATH } from "./constants.js";

export interface IBenchmarkDb {
  railgun: TMainnetRootQuery["railgunProtocolStats"] | null;
  tornadoCash: TMainnetRootQuery["tornadoCashProtocolStats"] | null;
  privacyPools: TMainnetRootQuery["privacyPoolsProtocolStats"] | null;
  hinkal: TMainnetRootQuery["hinkalProtocolStats"] | null;
  fluidkey: Partial<TMainnetRootQuery["fluidkeyProtocolStats"]> & {
    publicToStealthETH: FeeMetrics;
    publicToStealthWETH: FeeMetrics;
    publicToStealthUSDC: FeeMetrics;
    publicToStealthUSDT: FeeMetrics;
  };
  redact: TSepoliaRootQuery["redactProtocolStats"] | null;
  intmax: {
    depositEth: FeeMetrics | undefined;
    withdrawEth: FeeMetrics | undefined;
  };
  monero: {
    transfer: Partial<FeeMetrics> | undefined;
  };
  houdiniswap: {
    publicToCEXETH: FeeMetrics;
    CEXToPublicETH: FeeMetrics;
    publicToCEXWETH: FeeMetrics;
    CEXToPublicWETH: FeeMetrics;
    publicToCEXUSDC: FeeMetrics;
    CEXToPublicUSDC: FeeMetrics;
    publicToCEXUSDT: FeeMetrics;
    CEXToPublicUSDT: FeeMetrics;
  };
}

const serializeBigInt = (_key: string, value: unknown) => (typeof value === "bigint" ? `${value.toString()}n` : value);

const deserializeBigInt = (_key: string, value: unknown) => {
  if (typeof value === "string" && /^\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1));
  }
  return value;
};

export const db = new Low<Partial<IBenchmarkDb>>(
  {
    read: async () => {
      try {
        return JSON.parse(await readFile(BENCHMARKS_OUTPUT_PATH, "utf-8"), deserializeBigInt) as Partial<IBenchmarkDb>;
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
