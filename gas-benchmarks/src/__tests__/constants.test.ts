import { beforeAll, describe, expect, it } from "vitest";

import { resolve } from "node:path";

import type { Entry } from "./types.js";

import {
  extractEtherscanUrls,
  findProtocolConstantsFiles,
  hasEtherscanExample,
  hasSolUrl,
  parseConstantsFile,
} from "./utils.js";

describe("constants.ts files", () => {
  let files: Entry[] = [];

  beforeAll(() => {
    const srcDir = resolve(__dirname, "..");

    const filePaths = findProtocolConstantsFiles(srcDir);

    files = filePaths.map((filePath) => ({
      filePath,
      ...parseConstantsFile(filePath),
    }));
  });

  it("should have at least one contract address", () => {
    files.forEach(({ filePath, addresses }) => {
      expect(
        addresses.length,
        `${filePath} must have at least one contract address (Hex-typed constant)`,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it("should have at least two events array", () => {
    files.forEach(({ filePath, events }) => {
      expect(
        events.length,
        `${filePath} must have at least two events arrays (array with parseAbiItem calls)`,
      ).toBeGreaterThanOrEqual(2);
    });
  });

  it("should have a URL to a .sol source file for each contract address", () => {
    files.forEach(({ filePath, addresses }) => {
      addresses.forEach(({ name, comment }) => {
        expect(hasSolUrl(comment), `JSDoc for ${name} in ${filePath} must have a URL ending in .sol`).toBe(true);
      });
    });
  });

  it("should have a URL to a .sol source file for each events array indicating the function that emits the events", () => {
    files.forEach(({ filePath, events }) => {
      events.forEach(({ name, comment }) => {
        expect(hasSolUrl(comment), `JSDoc for ${name} in ${filePath} must have a URL ending in .sol`).toBe(true);
      });
    });
  });

  it("should have a Emits: section describing all events for each events array", () => {
    files.forEach(({ filePath, events }) => {
      events.forEach(({ name, arrayEventCount, emitsEventCount }) => {
        expect(
          emitsEventCount,
          `JSDoc for ${name} in ${filePath} must describe all ${arrayEventCount} event(s) in the Emits: section`,
        ).toBe(arrayEventCount);
      });
    });
  });

  it("should have an Example: section with an etherscan transaction URL for each events array", () => {
    files.forEach(({ filePath, events }) => {
      events.forEach(({ name, comment }) => {
        expect(
          hasEtherscanExample(comment),
          `JSDoc for ${name} in ${filePath} must contain an etherscan.io/tx/0x123... example URL`,
        ).toBe(true);
      });
    });
  });

  it("should not repeat etherscan URL examples across events arrays", () => {
    const allUrls: string[] = [];
    const urlToLocations: Record<string, string[]> = {};

    files.forEach(({ filePath, events }) => {
      events.forEach(({ name, comment }) => {
        const urls = extractEtherscanUrls(comment);
        urls.forEach((url) => {
          allUrls.push(url);
          if (!urlToLocations[url]) {
            urlToLocations[url] = [];
          }
          urlToLocations[url].push(`${filePath} (${name})`);
        });
      });
    });

    const duplicates = Object.entries(urlToLocations)
      .filter(([, locations]) => locations.length > 1)
      .map(([url, locations]) => `${url} found in: ${locations.join(", ")}`);

    expect(
      duplicates,
      `Etherscan URLs must not be repeated across events arrays:\n${duplicates.join("\n")}`,
    ).toHaveLength(0);
  });
});
