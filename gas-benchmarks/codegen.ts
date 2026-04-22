import { config } from "dotenv";
import path from "node:path";

import type { CodegenConfig } from "@graphql-codegen/cli";

config();

if (!process.env.SUBGRAPH_URL) {
  throw new Error("SUBGRAPH_URL is not set");
}

const codegenConfig: CodegenConfig = {
  overwrite: true,
  schema: [process.env.SUBGRAPH_URL, path.resolve(".", "scalars.graphql")],
  ignoreNoDocuments: true,
  documents: ["src/**/*.ts"],
  emitLegacyCommonJSImports: false,
  generates: {
    "src/generated/": {
      preset: "client-preset",
      config: {
        useTypeImports: true,
      },
    },
  },
};

export default codegenConfig;
