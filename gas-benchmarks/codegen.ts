import { config } from "dotenv";
import path from "node:path";

import type { CodegenConfig } from "@graphql-codegen/cli";

config();

const schemas = {
  mainnet: process.env.MAINNET_SUBGRAPH_URL,
  sepolia: process.env.SEPOLIA_SUBGRAPH_URL,
} as const;

Object.entries(schemas).forEach(([name, url]) => {
  if (!url) {
    throw new Error(`${name.toUpperCase()}_SUBGRAPH_URL is not set`);
  }
});

const sharedConfig = {
  preset: "client-preset" as const,
  config: {
    useTypeImports: true,
  },
};

const codegenConfig: CodegenConfig = {
  overwrite: true,
  ignoreNoDocuments: true,
  emitLegacyCommonJSImports: false,
  generates: {
    "src/generated/mainnet/": {
      schema: [schemas.mainnet!, path.resolve(".", "scalars.graphql")],
      documents: [
        "src/subgraph/railgun.ts",
        "src/subgraph/tornado-cash.ts",
        "src/subgraph/hinkal.ts",
        "src/subgraph/fluidkey.ts",
        "src/subgraph/privacy-pools.ts",
        "src/subgraph/mainnet.ts",
      ],
      ...sharedConfig,
    },

    "src/generated/sepolia/": {
      schema: [schemas.sepolia!, path.resolve(".", "scalars.graphql")],
      documents: ["src/subgraph/redact.ts", "src/subgraph/sepolia.ts"],
      ...sharedConfig,
    },
  },
};

export default codegenConfig;
