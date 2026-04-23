import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync } from "fs";
import { PROPERTY_DEFINITIONS } from "../src/data/schema.js";
import type { Property, PropertyContent } from "../src/types.js";
import { buildEvaluationPrompt } from "./research-prompts.js";
import { type ProtocolConfig } from "./research-config.js";

const SKIP_PROPERTIES = new Set([
  "Anonymity set size",
  "On-chain gas cost: deposit",
  "On-chain gas cost: transfer",
  "On-chain gas cost: withdraw",
]);

type CacheEntry = { name: string; url: string; summary: string };
type ResearchCache = { id: string; generatedAt: string; properties: CacheEntry[] };

export function loadResearchCache(protocolId: string): ResearchCache {
  const cachePath = new URL(`./research-cache/${protocolId}.json`, import.meta.url);
  if (!existsSync(cachePath)) {
    throw new Error(
      `Research cache missing at ${cachePath.pathname}.\n` +
        `Run /research-sources ${protocolId} in Claude Code to populate it before invoking this script.`,
    );
  }
  return JSON.parse(readFileSync(cachePath, "utf-8"));
}

export async function evaluateProperties(config: ProtocolConfig, existingProperties: Property[], only: string[]) {
  const client = new Anthropic();
  const cache = loadResearchCache(config.id);
  const cacheByName = new Map(cache.properties.map((entry) => [entry.name, entry]));

  const targetedUrls = cache.properties
    .filter((entry) => only.length === 0 || only.includes(entry.name))
    .map((entry) => entry.url);
  const uniqueUrls = Array.from(new Set(targetedUrls));
  const fetchedByUrl = new Map<string, { text: string; sourceUrl: string }>();
  await Promise.all(
    uniqueUrls.map(async (url) => {
      const fetched = await fetchTextFromUrl(url);
      if (fetched) fetchedByUrl.set(url, fetched);
      else console.warn(`warn: failed to fetch ${url} — properties citing it will be INSUFFICIENT_DATA`);
    }),
  );

  const properties: Property[] = [];
  let okCount = 0;
  let errorCount = 0;

  for (const propertyDefinition of PROPERTY_DEFINITIONS) {
    const existingProperty = existingProperties.find((p) => p.name === propertyDefinition.name);
    const isNotSelected = only.length > 0 && !only.includes(propertyDefinition.name);
    const isSkipped = SKIP_PROPERTIES.has(propertyDefinition.name);

    if (isNotSelected || isSkipped) {
      properties.push(existingProperty!);
      continue;
    }

    const cached = cacheByName.get(propertyDefinition.name);
    if (!cached) {
      throw new Error(
        `Research cache is missing an entry for "${propertyDefinition.name}". ` +
          `Rerun /research-sources ${config.id} --only "${propertyDefinition.name}" to populate it.`,
      );
    }

    console.log(`Analysing ${propertyDefinition.name}`);
    console.log(`source: ${cached.url}`);

    let property: Property = { name: propertyDefinition.name, value: "INSUFFICIENT_DATA" };
    try {
      const fetched = fetchedByUrl.get(cached.url);
      if (!fetched) throw new Error(`Failed to fetch ${cached.url}`);
      property = await evaluateWithCitations(
        client,
        propertyDefinition,
        config.title,
        fetched,
        cached.summary,
        config.context,
      );
    } catch (err) {
      console.log(`error: ${err instanceof Error ? err.message : err}`);
    }

    if (property.value && property.value !== "INSUFFICIENT_DATA" && !property.citations?.length) {
      property.needsResearchReview = true;
    }

    properties.push(property);
    console.log(`= ${property.value} [${property.citations?.length ?? 0} citations]\n`);
    property.value === "INSUFFICIENT_DATA" ? errorCount++ : okCount++;
  }

  console.log(`\nDone: ${okCount} ok, ${errorCount} insufficient`);
  return properties;
}

async function evaluateWithCitations(
  client: Anthropic,
  propertyDefinition: PropertyContent,
  protocolName: string,
  fetched: { text: string; sourceUrl: string },
  researchSummary: string,
  context?: string,
): Promise<Property> {
  // We need two things back from Claude: a typed answer (e.g. "UTXO-based state model") AND citations.
  //   - tool_use blocks give us a typed answer with no string parsing, but can't carry citations.
  //   - text blocks can carry citations (when `citations.enabled` is on), but are free-form prose.
  // So we ask for both: prose for the evidence, tool call for the answer, then stitch them together.
  const tool: Anthropic.Tool = {
    name: "record_evaluation",
    description: "Record the final evaluation. Call exactly once after writing your prose answer.",
    input_schema: {
      type: "object",
      properties: {
        value: buildValueSchema(propertyDefinition),
        insufficient_data: { type: "boolean" },
      },
      required: [],
    },
  };

  // Single API call that asks for BOTH prose (with citations) and a tool_use block.
  // `citations: { enabled: true }` is what makes the API attach citations to text blocks.
  // `disable_parallel_tool_use` ensures at most one tool_use block in the response.
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 2048,
    tools: [tool],
    tool_choice: { type: "auto", disable_parallel_tool_use: true },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "text", media_type: "text/plain", data: fetched.text },
            title: fetched.sourceUrl,
            citations: { enabled: true },
            cache_control: { type: "ephemeral" },
          },
          { type: "text", text: buildEvaluationPrompt(propertyDefinition, protocolName, researchSummary, context) },
        ],
      },
    ],
  });

  const usage = response.usage;
  console.log(
    `cache: read=${usage.cache_read_input_tokens ?? 0} write=${usage.cache_creation_input_tokens ?? 0} miss=${usage.input_tokens}`,
  );

  // Response is a list of blocks. Sort each into the right bucket:
  //   tool_use block  -> structured value (the "answer")
  //   text block      -> prose + citations (the "evidence")
  const textParts: string[] = [];
  const citations: NonNullable<Property["citations"]> = [];
  const seen = new Set<string>();
  let toolInput: { value?: string; insufficient_data: boolean } | null = null;

  for (const block of response.content) {
    // Bucket 1: the structured answer Claude put into the tool "slot".
    if (block.type === "tool_use" && block.name === "record_evaluation") {
      if (toolInput) throw new Error("Model called record_evaluation more than once");
      toolInput = normalizeToolInput(block.input, propertyDefinition.options);
      continue;
    }
    // Bucket 2: the prose, and any citations the API attached to it.
    if (block.type !== "text") continue;
    textParts.push(block.text);
    for (const citation of block.citations ?? []) {
      if (citation.type === "char_location" && !seen.has(citation.cited_text)) {
        seen.add(citation.cited_text);
        citations.push({
          cited_text: citation.cited_text,
          source: fetched.sourceUrl,
          start_char_index: citation.start_char_index,
          end_char_index: citation.end_char_index,
        });
      }
    }
  }

  if (!toolInput) throw new Error("Model did not call record_evaluation");
  if (toolInput.insufficient_data || !toolInput.value) {
    return { name: propertyDefinition.name, value: "INSUFFICIENT_DATA" };
  }

  // Stitch the two buckets into one record: value from tool_use, notes+citations from text.
  const notes = textParts.join("\n").replace(/\s+/g, " ").trim();
  const property: Property = { name: propertyDefinition.name, value: toolInput.value };
  if (notes) property.notes = notes;
  if (citations.length > 0) property.citations = citations;
  return property;
}

function buildValueSchema(p: PropertyContent): Record<string, unknown> {
  if (p.inputType === "multi-select") return { type: "array", items: { type: "string" } };
  return { type: "string" };
}

function normalizeToolInput(
  input: unknown,
  options: readonly string[] | undefined,
): { value?: string; insufficient_data: boolean } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const insufficientData = raw.insufficient_data === true;
  const rawValue = raw.value;

  if (Array.isArray(rawValue)) {
    const allStrings = rawValue.every((x) => typeof x === "string");
    const allAllowed = !options || (allStrings && rawValue.every((x) => options.includes(x as string)));
    return {
      value: allStrings && allAllowed ? JSON.stringify(rawValue) : undefined,
      insufficient_data: insufficientData,
    };
  }
  if (typeof rawValue === "string") {
    const allowed = !options || options.includes(rawValue);
    return { value: allowed ? rawValue : undefined, insufficient_data: insufficientData };
  }
  return { value: undefined, insufficient_data: insufficientData };
}

/** Fetch a URL and strip to plain text. Returns null on failure. */
async function fetchTextFromUrl(url: string): Promise<{ text: string; sourceUrl: string } | null> {
  if (url.endsWith(".pdf")) {
    return fetchTextFromUrl(url.replace(/\.pdf$/, ".html"));
  }

  if (url.match(/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/)) {
    const base = url.replace("github.com", "raw.githubusercontent.com").replace(/\/$/, "");
    for (const branch of ["main", "master"]) {
      const rawUrl = `${base}/${branch}/README.md`;
      const response = await fetch(rawUrl, { signal: AbortSignal.timeout(15_000) }).catch(() => null);
      if (response?.ok) return { text: (await response.text()).replace(/<[^>]+>/g, "").trim(), sourceUrl: rawUrl };
    }
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) }).catch(() => null);
  if (!response?.ok) return null;

  const text = (await response.text())
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<(nav|aside)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?(h[1-6]|p|div|li|tr|br|hr|section|article|header|footer|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n /g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { text, sourceUrl: url };
}
