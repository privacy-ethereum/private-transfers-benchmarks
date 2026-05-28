import { Low } from "lowdb";

import { readFile, writeFile } from "node:fs/promises";

import type { FeeMetrics } from "./types.js";
import type { TArbitrumRootQuery } from "../subgraph/arbitrum.js";
import type { TBaseRootQuery } from "../subgraph/base.js";
import type { TMainnetRootQuery } from "../subgraph/mainnet.js";
import type { TScrollRootQuery } from "../subgraph/scroll.js";
import type { TSepoliaRootQuery } from "../subgraph/sepolia.js";

import { BENCHMARKS_OUTPUT_PATH } from "./constants.js";

export interface IBenchmarkDb {
  blanksquare: TBaseRootQuery["blanksquareProtocolStats"] | null;
  curvy: TArbitrumRootQuery["fluidkeyProtocolStats"] | null;
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
    mainnet: TMainnetRootQuery["intmaxMainnetProtocolStats"] | null;
    scroll: TScrollRootQuery["intmaxScrollProtocolStats"] | null;
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
  worm: TMainnetRootQuery["wormProtocolStats"] | null;
  zerc20: TMainnetRootQuery["zerc20ProtocolStats"] | null;
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
