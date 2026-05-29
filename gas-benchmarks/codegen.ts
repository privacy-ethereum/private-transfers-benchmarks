import { config } from "dotenv";
import path from "node:path";

import type { CodegenConfig } from "@graphql-codegen/cli";

config();

const schemas = {
  arbitrum: process.env.ARBITRUM_SUBGRAPH_URL,
  base: process.env.BASE_SUBGRAPH_URL,
  mainnet: process.env.MAINNET_SUBGRAPH_URL,
  scroll: process.env.SCROLL_SUBGRAPH_URL,
  sepolia: process.env.SEPOLIA_SUBGRAPH_URL,
} as const;

Object.entries(schemas).forEach(([name, url]) => {
  if (!url) {
    throw new Error(`${name.toUpperCase()}_SUBGRAPH_URL is not set`);
  }
});

const sharedConfig = (schema: string, documents: string[]) => ({
  preset: "client-preset" as const,
  schema: [schema, path.resolve(".", "scalars.graphql")],
  documents,
  config: {
    useTypeImports: true,
  },
});

const codegenConfig: CodegenConfig = {
  overwrite: true,
  ignoreNoDocuments: true,
  emitLegacyCommonJSImports: false,
  generates: {
    "src/generated/arbitrum/": {
      ...sharedConfig(schemas.arbitrum!, ["src/subgraph/curvy.ts", "src/subgraph/arbitrum.ts"]),
    },

    "src/generated/base/": {
      ...sharedConfig(schemas.base!, ["src/subgraph/blanksquare.ts", "src/subgraph/base.ts"]),
    },

    "src/generated/mainnet/": {
      ...sharedConfig(schemas.mainnet!, [
        "src/subgraph/fluidkey.ts",
        "src/subgraph/hinkal.ts",
        "src/subgraph/intmax.ts",
        "src/subgraph/privacy-pools.ts",
        "src/subgraph/railgun.ts",
        "src/subgraph/tornado-cash.ts",
        "src/subgraph/worm.ts",
        "src/subgraph/zerc20.ts",
        "src/subgraph/mainnet.ts",
      ]),
    },

    "src/generated/scroll/": {
      ...sharedConfig(schemas.scroll!, ["src/subgraph/intmax.ts", "src/subgraph/scroll.ts"]),
    },

    "src/generated/sepolia/": {
      ...sharedConfig(schemas.sepolia!, ["src/subgraph/redact.ts", "src/subgraph/sepolia.ts"]),
    },
  },
};

export default codegenConfig;
