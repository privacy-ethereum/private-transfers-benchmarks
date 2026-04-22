import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import pkg from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import _import from "eslint-plugin-import";
import json from "eslint-plugin-json";
import prettier from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

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

// ── Shared plugins ────────────────────────────────────────────────────────────

const sharedPlugins = {
  json,
  prettier,
  "unused-imports": unusedImports,
  import: fixupPluginRules(_import),
  "@typescript-eslint": fixupPluginRules(typescriptEslint),
};

const sharedParserOptions = {
  typescript: true,
  experimentalDecorators: true,
  requireConfigFile: false,
  ecmaFeatures: { classes: true, impliedStrict: true },
  warnOnUnsupportedTypeScriptVersion: true,
};

// ── Shared rules applied to both packages ────────────────────────────────────

const sharedRules = {
  "no-console": "error",
  "unused-imports/no-unused-imports": "error",
  "prettier/prettier": ["error", prettierOptions],
  "@typescript-eslint/no-non-null-assertion": "off",
  "@typescript-eslint/prefer-nullish-coalescing": "off",
  "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
  "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
  "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
  "@typescript-eslint/no-shadow": [
    "error",
    {
      builtinGlobals: true,
      allow: ["location", "event", "history", "name", "status", "Option", "test", "expect", "jest"],
    },
  ],
};

// ── gas-benchmarks: Node.js, full airbnb + typescript ruleset ────────────────

const gasExtends = fixupConfigRules(
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
);

const gasConfig = {
  files: ["gas-benchmarks/src/**/*.ts"],
  extends: gasExtends,
  plugins: sharedPlugins,
  languageOptions: {
    parser: tsParser,
    sourceType: "module",
    ecmaVersion: 2022,
    globals: globals.node,
    parserOptions: {
      ...sharedParserOptions,
      project: resolve(__dirname, "./gas-benchmarks/tsconfig.json"),
    },
  },
  settings: {
    react: { version: "999.999.999" },
    "import/resolver": {
      typescript: { project: resolve(__dirname, "./gas-benchmarks/tsconfig.json") },
      node: { extensions: [".ts", ".js"], moduleDirectory: ["node_modules", "ts", "src"] },
    },
  },
  linterOptions: { reportUnusedDisableDirectives: isProduction },
  rules: {
    ...sharedRules,
    "import/no-cycle": ["error"],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.ts",
          "**/__benchmarks__/**",
          "**/tests/**",
          "**/__tests__/**",
          "**/vitest.config.ts",
        ],
      },
    ],
    "no-debugger": isProduction ? "error" : "off",
    "no-underscore-dangle": "error",
    "no-redeclare": ["error", { builtinGlobals: true }],
    "import/order": [
      "error",
      {
        groups: ["external", "builtin", "internal", "type", "parent", "sibling", "index", "object"],
        alphabetize: { order: "asc", caseInsensitive: true },
        warnOnUnassignedImports: true,
        "newlines-between": "always",
      },
    ],
    "import/prefer-default-export": "off",
    "import/extensions": ["error", { json: "always" }],
    "class-methods-use-this": "off",
    "prefer-promise-reject-errors": "off",
    "max-classes-per-file": "off",
    "no-use-before-define": ["off"],
    "no-shadow": "off",
    curly: ["error", "all"],
    "no-return-await": "off",
    "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "no-public" }],
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-use-before-define": ["error", { functions: false, classes: false }],
  },
};

// ── project-evaluations: React + Browser, leaner typescript + prettier ruleset ──

const evalExtends = fixupConfigRules(
  compat.extends(
    "prettier",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/strict",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ),
);

const evalConfig = {
  files: ["project-evaluations/src/**/*.ts", "project-evaluations/src/**/*.tsx"],
  extends: evalExtends,
  plugins: {
    prettier,
    "unused-imports": unusedImports,
    "@typescript-eslint": fixupPluginRules(typescriptEslint),
    react: fixupPluginRules(reactPlugin),
    "react-hooks": fixupPluginRules(reactHooksPlugin),
  },
  languageOptions: {
    parser: tsParser,
    sourceType: "module",
    ecmaVersion: 2022,
    globals: globals.browser,
    parserOptions: {
      ...sharedParserOptions,
      project: resolve(__dirname, "./project-evaluations/tsconfig.json"),
    },
  },
  settings: {
    react: { version: "detect" },
  },
  linterOptions: { reportUnusedDisableDirectives: isProduction },
  rules: {
    ...sharedRules,
    // Not needed with the new JSX transform (react-jsx).
    "react/react-in-jsx-scope": "off",
    // TypeScript enforces prop types; PropTypes are redundant.
    "react/prop-types": "off",
    // PropertyDefinition clashes with the DOM global of the same name.
    "@typescript-eslint/no-shadow": [
      "error",
      {
        builtinGlobals: true,
        allow: ["name", "PropertyDefinition"],
      },
    ],
  },
};

const subgraphExtends = fixupConfigRules(
  compat.extends(
    "airbnb",
    "prettier",
    "plugin:import/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/strict",
    "plugin:@typescript-eslint/stylistic",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ),
);

const subgraphConfig = {
  files: ["subgraph/src/**/*.ts", "subgraph/tests/**/*.ts"],
  extends: subgraphExtends,
  plugins: sharedPlugins,
  languageOptions: {
    parser: tsParser,
    sourceType: "module",
    ecmaVersion: 2022,
    globals: globals.node,
    parserOptions: {
      ...sharedParserOptions,
      project: resolve(__dirname, "./subgraph/tsconfig.json"),
    },
  },
  settings: {
    react: { version: "999.999.999" },
    "import/resolver": {
      typescript: {},
      node: { extensions: [".ts", ".js"], moduleDirectory: ["node_modules", "src", "tests", "generated"] },
    },
  },
  linterOptions: { reportUnusedDisableDirectives: isProduction },
  rules: {
    ...sharedRules,
    "import/no-unresolved": ["error", { ignore: ["generated"] }],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/*.test.ts", "**/tests/**"],
      },
    ],
    "no-debugger": isProduction ? "error" : "off",
    "no-underscore-dangle": "error",
    "no-redeclare": ["error", { builtinGlobals: true }],
    "import/order": [
      "error",
      {
        groups: ["external", "builtin", "internal", "type", "parent", "sibling", "index", "object"],
        alphabetize: { order: "asc", caseInsensitive: true },
        warnOnUnassignedImports: true,
        "newlines-between": "always",
      },
    ],
    "import/prefer-default-export": "off",
    "import/extensions": ["error", { json: "always" }],
    "class-methods-use-this": "off",
    "prefer-promise-reject-errors": "off",
    "max-classes-per-file": "off",
    "no-use-before-define": ["off"],
    "no-shadow": "off",
    curly: ["error", "all"],
    "no-return-await": "off",
    "prefer-destructuring": "off",
    "@typescript-eslint/prefer-for-of": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "no-public" }],
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-use-before-define": ["error", { functions: false, classes: false }],
    "@typescript-eslint/no-shadow": [
      "error",
      {
        builtinGlobals: true,
        allow: ["BigInt", "Request", "describe", "afterEach", "beforeEach", "beforeAll"],
      },
    ],
  },
};

// ── Export ────────────────────────────────────────────────────────────────────

export default defineConfig([
  gasConfig,
  evalConfig,
  subgraphConfig,
  globalIgnores([
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/build",
    "eslint.config.js",
    "gas-benchmarks/src/generated",
    "subgraph/generated",
  ]),
]);
