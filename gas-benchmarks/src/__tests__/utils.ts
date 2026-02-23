import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import type { AddressEntry, EventsEntry } from "./types.js";

/**
 * Recursively scan `srcDir` for `constants.ts` files, skipping excluded directories.
 */
export function findProtocolConstantsFiles(srcDir: string): string[] {
  const EXCLUDED_DIRS = new Set(["__tests__", "utils"]);

  const results: string[] = [];

  function scan(dir: string): void {
    readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) {
          scan(path);
        }
      } else if (entry.name === "constants.ts") {
        results.push(path);
      }
    });
  }

  scan(srcDir);
  return results;
}

/**
 * Extract JSDoc comment + constant name pairs from a constants.ts source file.
 * Returns Hex address constants and events array constants separately.
 */
export function parseConstantsFile(filePath: string): { addresses: AddressEntry[]; events: EventsEntry[] } {
  const source = readFileSync(filePath, "utf-8");
  const addresses: AddressEntry[] = [];
  const events: EventsEntry[] = [];

  // Match JSDoc block followed by a Hex-typed export const
  const hexRegEx = /\/\*\*([\s\S]*?)\*\/\s*export const (\w+)\s*:\s*Hex\s*=/g;
  let match = hexRegEx.exec(source);

  while (match !== null) {
    addresses.push({
      comment: match[1] ?? "",
      name: match[2] ?? "",
      file: filePath,
    });
    match = hexRegEx.exec(source);
  }

  // Match JSDoc block followed by an events array export const (ends with `] as const`)
  const eventsRegEx = /\/\*\*([\s\S]*?)\*\/\s*export const (\w+)\s*=\s*\[([\s\S]*?)\]\s*as const/g;
  match = eventsRegEx.exec(source);

  while (match !== null) {
    const comment = match[1] ?? "";
    const name = match[2] ?? "";
    const arrayContent = match[3] ?? "";

    // Count `parseAbiItem` calls in the array → number of events declared
    const arrayEventCount = (arrayContent.match(/parseAbiItem\(/g) ?? []).length;

    // Extract the Emits: section (between "Emits:" and "Example:" or end of comment)
    const emitsSection = /Emits:([\s\S]*?)(?:Example:|$)/.exec(comment)?.[1] ?? "";

    // Count lines of the form "* EventName() - description"
    const emitsEventCount = (emitsSection.match(/\*\s+\w+\([^)]*\)\s*-/g) ?? []).length;

    events.push({ name, comment, file: filePath, arrayEventCount, emitsEventCount });
    match = eventsRegEx.exec(source);
  }

  return { addresses, events };
}

/** Checks that a JSDoc comment contains a URL whose path ends with `.sol`. */
export function hasSolUrl(comment: string): boolean {
  return /https?:\/\/\S+\.sol(?:#\S*)?(?=\s|$)/i.test(comment);
}

/** Extracts etherscan transaction URLs from a JSDoc comment. */
export function extractEtherscanUrls(comment: string): string[] {
  const blockExplorerTxUrlRegEx = /https:\/\/[a-z]+scan\.[a-z]+\/tx\/0x[\da-fA-F]+/;
  const matches = comment.match(new RegExp(blockExplorerTxUrlRegEx.source, "g"));
  return matches ?? [];
}

/** Checks that a JSDoc comment contains an etherscan transaction example URL. */
export function hasEtherscanExample(comment: string): boolean {
  return extractEtherscanUrls(comment).length > 0;
}
