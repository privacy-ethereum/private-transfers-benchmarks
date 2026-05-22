import { describe, expect, it } from "vitest";

import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { INTMAX_CONFIG } from "../intmax/constants.js";

const PROTOCOL_CONFIGS = [{ name: "intmax", config: INTMAX_CONFIG }];

/** Directories excluded from protocol config checks */
const EXCLUDED_DIRS = new Set(["__tests__", "utils", "monero"]);

describe("constants.ts files", () => {
  it("should have a config entry for every protocol directory with a constants.ts file", () => {
    const srcDirectory = resolve(__dirname, "..");
    const allDirectories = readdirSync(srcDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !EXCLUDED_DIRS.has(entry.name))
      .map((entry) => entry.name);

    const protocolDirectories = allDirectories.filter((directory) => {
      const protocolDirectoryPath = join(srcDirectory, directory);
      const files = readdirSync(protocolDirectoryPath);
      return files.includes("constants.ts");
    });

    const configuredNames = new Set(PROTOCOL_CONFIGS.map(({ name }) => name));
    const missing = protocolDirectories.filter((directory) => !configuredNames.has(directory));

    expect(missing, `Missing PROTOCOL_CONFIGS entries for: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("should have at least two distinct event arrays per protocol", () => {
    PROTOCOL_CONFIGS.forEach(({ name, config }) => {
      const uniqueEventArrays = new Set(config.operations.map(({ events }) => events));
      expect(uniqueEventArrays.size, `${name} must have at least two distinct event arrays`).toBeGreaterThanOrEqual(2);
    });
  });

  it("should not repeat example transaction URLs across operations", () => {
    const allExampleTxUrls = PROTOCOL_CONFIGS.flatMap(({ config }) =>
      config.operations.map(({ exampleTxUrl }) => exampleTxUrl),
    );
    const uniqueExampleTxUrls = new Set(allExampleTxUrls);

    expect(uniqueExampleTxUrls.size, "Duplicate example transaction URLs found").toBe(allExampleTxUrls.length);
  });
});
