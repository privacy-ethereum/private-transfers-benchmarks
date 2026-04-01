import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { PROPERTY_DEFINITIONS } from "../src/data/schema.js";
import type { Property, PropertyContent } from "../src/types.js";
import { buildResearchPrompt, buildEvaluationPrompt } from "./research-prompts.js";
import { type ProtocolConfig } from "./research-config.js";

const SKIP_PROPERTIES = new Set([
  "Anonymity set size",
  "On-chain gas cost: deposit",
  "On-chain gas cost: transfer",
  "On-chain gas cost: withdraw",
]);

/** Loop through property definitions, skip/keep as needed, and evaluate each. */
export async function evaluateProperties(config: ProtocolConfig, existingProperties: Property[], only: string[]) {
  const client = new Anthropic();

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

    console.log(`Analysing ${propertyDefinition.name}`);
    let property: Property = { name: propertyDefinition.name, value: "INSUFFICIENT_DATA" };
    const triedUrls: string[] = [];

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { url, summary } = await researchProperty(client, propertyDefinition, config, triedUrls);
        triedUrls.push(url);
        console.log(`source: ${url}${attempt > 0 ? ` (retry ${attempt})` : ""}`);
        property = await evaluateWithCitations(client, propertyDefinition, config.title, url, summary);
        if (property.value !== "INSUFFICIENT_DATA") break;
      } catch (err) {
        console.log(`retry: ${err instanceof Error ? err.message : err}`);
      }
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

/** Web search to find the best source URL and summary. */
async function researchProperty(
  client: Anthropic,
  propertyDefinition: PropertyContent,
  config: ProtocolConfig,
  triedUrls: string[] = [],
): Promise<{ url: string; summary: string }> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    temperature: 0,
    messages: [
      { role: "user", content: buildResearchPrompt(propertyDefinition, config.title, config.sourceUrls, triedUrls) },
    ],
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in research response");

  const parsed = JSON.parse(jsonMatch[0]);
  if (parsed.url?.endsWith(".pdf")) throw new Error(`PDF: ${parsed.url}`);
  if (!parsed.url) throw new Error("No URL found");

  return { url: parsed.url, summary: parsed.summary || "" };
}

/** Fetch source page, pass as citable document, return property with citations. */
async function evaluateWithCitations(
  client: Anthropic,
  propertyDefinition: PropertyContent,
  protocolName: string,
  sourceUrl: string,
  researchSummary: string,
): Promise<Property> {
  const fetched = await fetchTextFromUrl(sourceUrl);
  if (!fetched) throw new Error(`Failed to fetch ${sourceUrl}`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "text", media_type: "text/plain", data: fetched.text },
            title: fetched.sourceUrl,
            citations: { enabled: true },
          },
          { type: "text", text: buildEvaluationPrompt(propertyDefinition, protocolName, researchSummary) },
        ],
      },
    ],
  });

  // Extract text and deduplicated char_location citations
  const textParts: string[] = [];
  const citations: NonNullable<Property["citations"]> = [];
  const seen = new Set<string>();

  for (const block of response.content) {
    if (block.type !== "text") continue;
    textParts.push(block.text);
    if (!block.citations) continue;
    for (const citation of block.citations) {
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

  // Parse JSON from response
  const text = textParts.join("");
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch || text.includes("INSUFFICIENT_DATA")) {
    return { name: propertyDefinition.name, value: "INSUFFICIENT_DATA" };
  }

  let parsed: { value?: string; notes?: string };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return { name: propertyDefinition.name, value: "INSUFFICIENT_DATA" };
  }

  // Normalize multi-select: model outputs "Option" instead of ["Option"]
  let value = String(parsed.value || "");
  if (propertyDefinition.inputType === "multi-select" && !value.startsWith("[")) {
    value = JSON.stringify([value]);
  }

  const property: Property = { name: propertyDefinition.name, value };
  if (parsed.notes) property.notes = String(parsed.notes).replace(/<\/?cite[^>]*>/g, "");
  if (citations.length > 0) property.citations = citations;
  return property;
}

/** Fetch a URL and strip to plain text. Returns null on failure. */
async function fetchTextFromUrl(url: string): Promise<{ text: string; sourceUrl: string } | null> {
  if (url.endsWith(".pdf")) {
    return fetchTextFromUrl(url.replace(/\.pdf$/, ".html"));
  }

  // GitHub HTML pages are mostly navigation — fetch the raw markdown instead
  if (url.match(/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/)) {
    const rawUrl = url.replace("github.com", "raw.githubusercontent.com") + "/master/README.md";
    const response = await fetch(rawUrl).catch(() => null);
    if (response?.ok) return { text: (await response.text()).replace(/<[^>]+>/g, "").trim(), sourceUrl: rawUrl };
  }

  const response = await fetch(url).catch(() => null);
  if (!response?.ok) return null;

  const text = (await response.text())
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
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
