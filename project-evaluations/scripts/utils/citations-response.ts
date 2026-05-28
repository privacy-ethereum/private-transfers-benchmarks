import type Anthropic from "@anthropic-ai/sdk";
import type { Property } from "../../src/types.js";
import type { FetchedSource } from "./fetch-source.js";

export interface ParsedResponse {
  value: string | string[];
  notes: string;
  citations: NonNullable<Property["citations"]>;
}

/**
 * Walk an Anthropic citations response: extract the tool_use value, the prose text blocks, and
 * dedupe citations attached to text blocks. Returns INSUFFICIENT_DATA when the model flags it
 * or returns a non-string/non-array value. The tool input_schema enforces the per-property
 * options enum upstream, so no post-hoc options check is needed here.
 */
export function parseCitationsResponse(response: Anthropic.Message, fetched: FetchedSource[]): ParsedResponse {
  const textBlocks = response.content.filter((b) => b.type === "text");
  const toolUse = response.content.find((b) => b.type === "tool_use" && b.name === "record_evaluation");
  if (toolUse?.type !== "tool_use") throw new Error("Model did not call record_evaluation");

  const notes = cleanNotes(textBlocks.map((b) => b.text).join("\n"));

  const citations: NonNullable<Property["citations"]> = [];
  const seen = new Set<string>();
  for (const c of textBlocks.flatMap((b) => b.citations ?? [])) {
    if (c.type !== "char_location" || seen.has(c.cited_text)) continue;
    seen.add(c.cited_text);
    const source = fetched[c.document_index]?.sourceUrl ?? fetched[0].sourceUrl;
    const kind = inferCitationKind(source);
    citations.push(kind ? { kind, cited_text: c.cited_text, source } : { cited_text: c.cited_text, source });
  }

  const input = (toolUse.input ?? {}) as { value?: unknown; insufficient_data?: boolean };
  const isNonEmpty = (v: unknown): v is string | string[] =>
    typeof v === "string" ? v.length > 0 : Array.isArray(v) && v.length > 0;
  if (input.insufficient_data || !isNonEmpty(input.value)) return { value: "INSUFFICIENT_DATA", notes, citations };
  return { value: input.value, notes, citations };
}

const EXPLORER_HOST =
  /^https?:\/\/(?:[a-z]+\.)*(?:etherscan\.io|basescan\.org|arbiscan\.io|polygonscan\.com|optimistic\.etherscan\.io|scrollscan\.com|lineascan\.build|solscan\.io|solana\.fm|bscscan\.com|snowtrace\.io)\//;
const L2BEAT_HOST = /^https?:\/\/(?:www\.)?l2beat\.com\//;

/** Infer the `kind` discriminator from a citation's source URL. Returns null when no kind applies
 *  (the citation defaults to the "standard" case and omits the field). */
function inferCitationKind(source: string): "explorer" | "l2beat" | null {
  if (EXPLORER_HOST.test(source)) return "explorer";
  if (L2BEAT_HOST.test(source)) return "l2beat";
  return null;
}

/** Strip zero-width / soft-hyphen chars (docs sites embed these and the model copies them through),
 *  collapse whitespace, drop spaces before punctuation. */
function cleanNotes(text: string): string {
  return text
    .replace(/[​-‍﻿­]/g, "")
    .replace(/\s+/g, " ")
    .replace(/ +([,.;:!?])/g, "$1")
    .trim();
}
