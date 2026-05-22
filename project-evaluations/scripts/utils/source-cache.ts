import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

/**
 * URL → fetched plain text. One `scripts/.source-cache/{protocol}.json` per protocol.
 * Written during the fetch phase, read during the evaluate phase, and read directly by review
 * tooling so verification doesn't depend on URL liveness — and so `cited_text` can be checked
 * against the exact text that was passed into the Anthropic API.
 */
export type SourceCache = Record<string, string>;

function cachePath(protocolId: string): URL {
  return new URL(`../.source-cache/${protocolId}.json`, import.meta.url);
}

export function writeSourceCache(protocolId: string, cache: SourceCache): void {
  const path = cachePath(protocolId);
  mkdirSync(dirname(fileURLToPath(path)), { recursive: true });
  writeFileSync(path, JSON.stringify(cache, null, 2) + "\n");
}

export function readSourceCache(protocolId: string): SourceCache {
  const path = cachePath(protocolId);
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf-8")) as SourceCache) : {};
}
