import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import pkg from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import _import from "eslint-plugin-import";
import json from "eslint-plugin-json";
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";

import { readFileSync } from "fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolve } from "path";

const { configs } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: configs.recommended,
  allConfig: configs.all,
});

const prettierConfig = readFileSync(resolve(__dirname, "./.prettierrc.json"), "utf8");
const prettierOptions = JSON.parse(prettierConfig);
const isProduction = process.env.NODE_ENV === "production";

export default defineConfig([
  {
    extends: fixupConfigRules(
      compat.extends(
        "airbnb",
        "prettier",
        "plugin:import/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/strict",
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:import/typescript",
      ),
    ),

    plugins: {
      json,
      prettier,
      "unused-imports": unusedImports,
      import: fixupPluginRules(_import),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      ecmaVersion: 2022,
      parserOptions: {
        project: resolve(__dirname, "./tsconfig.json"),
        typescript: true,
        experimentalDecorators: true,
        requireConfigFile: false,
        ecmaFeatures: {
          classes: true,
          impliedStrict: true,
        },
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },

    settings: {
      react: {
        version: "999.999.999",
      },

      "import/resolver": {
        typescript: {
          project: resolve(__dirname, "./tsconfig.json"),
        },

        node: {
          extensions: [".ts", ".js"],
          moduleDirectory: ["node_modules", "ts", "src"],
        },
      },
    },

    linterOptions: {
      reportUnusedDisableDirectives: isProduction,
    },

    rules: {
      "import/no-cycle": ["error"],
      "unused-imports/no-unused-imports": "error",
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: ["**/*.test.ts", "**/__benchmarks__/**", "**/tests/**", "**/__tests__/**"],
        },
      ],
      "no-debugger": isProduction ? "error" : "off",
      "no-console": "error",
      "no-underscore-dangle": "error",
      "no-redeclare": [
        "error",
        {
          builtinGlobals: true,
        },
      ],
      "import/order": [
        "error",
        {
          groups: ["external", "builtin", "internal", "type", "parent", "sibling", "index", "object"],

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },

          warnOnUnassignedImports: true,
          "newlines-between": "always",
        },
      ],
      "prettier/prettier": ["error", prettierOptions],
      "import/prefer-default-export": "off",
      "import/extensions": [
        "error",
        {
          json: "always",
        },
      ],
      "class-methods-use-this": "off",
      "prefer-promise-reject-errors": "off",
      "max-classes-per-file": "off",
      "no-use-before-define": ["off"],
      "no-shadow": "off",
      curly: ["error", "all"],
      "no-return-await": "off",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "no-public",
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-use-before-define": [
        "error",
        {
          functions: false,
          classes: false,
        },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/no-shadow": [
        "error",
        {
          builtinGlobals: true,

          allow: ["location", "event", "history", "name", "status", "Option", "test", "expect", "jest"],
        },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
        },
      ],
    },
  },
  globalIgnores([
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/build",
    "**/commitlint.config.js",
    "eslint.config.js",
  ]),
]);
