import "dotenv/config";
import { existsSync, readFileSync, writeFileSync } from "fs";
import Anthropic from "@anthropic-ai/sdk";
import { PROPERTY_DEFINITIONS } from "../src/data/schema.js";
import type { Evaluation, Property, PropertyContent } from "../src/types.js";
import { configs, type ProtocolConfig } from "./research-config.js";
import { callCitations } from "./utils/citations-request.js";
import { parseCitationsResponse } from "./utils/citations-response.js";
import { fetchTextFromUrl, type FetchedSource } from "./utils/fetch-source.js";

type CacheEntry = { name: string; urls: string[]; summary: string };
type ResearchCache = { id: string; generatedAt: string; properties: CacheEntry[] };

/** Properties skipped by research — measured separately (gas) or not yet automatable
 *  (anonymity set size). They carry through from the existing evaluation unchanged. */
const SKIP_PROPERTIES: ReadonlySet<string> = new Set([
  "Anonymity set size",
  "On-chain gas cost: deposit",
  "On-chain gas cost: transfer",
  "On-chain gas cost: withdraw",
]);

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required");
  const { protocolId, only } = parseArgs();
  const config = configs[protocolId];
  const cache = loadResearchCache(protocolId);
  const cacheByName = new Map(cache.properties.map((e) => [e.name, e]));
  const isInScope = (name: string) => !SKIP_PROPERTIES.has(name) && (only.length === 0 || only.includes(name));

  // Fail fast: every requested property (--only names, or all schema names) must have a cache entry.
  const missing = (only.length ? only : PROPERTY_DEFINITIONS.map((d) => d.name)).filter(
    (n) => !SKIP_PROPERTIES.has(n) && !cacheByName.has(n),
  );
  if (missing.length > 0) {
    throw new Error(`Research cache missing entries: ${missing.join(", ")}. Rerun /research-sources ${protocolId}.`);
  }

  // Phase 1 — fetch every unique URL once.
  const inScope = cache.properties.filter((e) => isInScope(e.name));
  const uniqueUrls = Array.from(new Set(inScope.flatMap((e) => e.urls)));
  console.log(`Fetching ${uniqueUrls.length} unique URLs for ${inScope.length} properties`);
  const snapshots: Record<string, string> = {};
  await Promise.all(
    uniqueUrls.map(async (url) => {
      const result = await fetchTextFromUrl(url);
      if (result) snapshots[url] = result.text;
      else console.warn(`warn: failed to fetch ${url}`);
    }),
  );
  console.log(`Fetched ${Object.keys(snapshots).length}/${uniqueUrls.length} URLs\n`);

  // Phase 2 — evaluate each in-scope property, carry the rest through from disk.
  // The evaluation JSON must already exist: status and categories are preserved from it.
  const evalPath = new URL(`../src/data/evaluations/${protocolId}.json`, import.meta.url);
  if (!existsSync(evalPath)) {
    throw new Error(`No evaluation at ${evalPath.pathname}. Create the stub first.`);
  }
  const existing = JSON.parse(readFileSync(evalPath, "utf-8")) as Evaluation;
  const existingByName = new Map(existing.properties.map((p) => [p.name, p]));
  const client = new Anthropic();

  const properties: Property[] = [];
  for (const def of PROPERTY_DEFINITIONS) {
    if (!isInScope(def.name)) {
      properties.push(existingByName.get(def.name) ?? { name: def.name, value: "" });
      continue;
    }
    properties.push(await evaluateProperty(client, def, config, cacheByName.get(def.name)!, snapshots));
  }
  const okCount = properties.filter((p) => isInScope(p.name) && p.value !== "INSUFFICIENT_DATA").length;
  console.log(`\nDone: ${okCount} ok, ${inScope.length - okCount} insufficient`);

  // Full runs take metadata from config; --only runs keep the existing file's metadata.
  // status and categories always come from the existing file — they are not in research-config.
  const base = only.length > 0 ? existing : config;
  const evaluation = {
    ...base,
    status: existing.status,
    categories: existing.categories,
    properties,
  } satisfies Evaluation;
  writeFileSync(evalPath, JSON.stringify(evaluation, null, 2) + "\n");
  console.log(`Wrote ${evalPath.pathname}`);
}

function parseArgs(): { protocolId: string; only: string[] } {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const protocolId = args.find((a) => !a.startsWith("--"));
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? (args[onlyIdx + 1]?.split(",").map((s) => s.trim()) ?? []) : [];
  if (!protocolId || !configs[protocolId]) {
    console.error(`Usage: pnpm run research <protocol> [--only "A,B"]\nAvailable: ${Object.keys(configs).join(", ")}`);
    process.exit(1);
  }
  return { protocolId, only };
}

function loadResearchCache(protocolId: string): ResearchCache {
  const path = new URL(`./research-cache/${protocolId}.json`, import.meta.url);
  if (!existsSync(path)) {
    throw new Error(
      `Research cache missing at ${path.pathname}.\nRun /research-sources ${protocolId} in Claude Code to populate it first.`,
    );
  }
  return JSON.parse(readFileSync(path, "utf-8")) as ResearchCache;
}

async function evaluateProperty(
  client: Anthropic,
  def: PropertyContent,
  config: ProtocolConfig,
  entry: CacheEntry,
  snapshots: Record<string, string>,
): Promise<Property> {
  console.log(`Analysing ${def.name}`);
  console.log(`sources: ${entry.urls.join(", ")}`);

  const fetched: FetchedSource[] = entry.urls.flatMap((url) => {
    const text = snapshots[url];
    return text ? [{ sourceUrl: url, text }] : [];
  });
  if (fetched.length === 0) throw new Error(`No cached source snapshots for ${def.name}`);

  const response = await callCitations(client, def, config.title, entry.summary, fetched, config.context);
  const { value, notes, citations } = parseCitationsResponse(response, fetched);
  if (value === "INSUFFICIENT_DATA") {
    console.log(`= INSUFFICIENT_DATA [0 citations]\n`);
    return { name: def.name, value: "INSUFFICIENT_DATA" };
  }

  const property: Property = { name: def.name, value };
  if (notes) property.notes = notes;
  if (citations.length > 0) property.citations = citations;
  else
    property.needsResearchReview =
      "Anthropic citations call returned no spans; the value and notes rest on the research summary rather than verifiable source text.";
  console.log(`= ${value} [${citations.length} citations]\n`);
  return property;
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
