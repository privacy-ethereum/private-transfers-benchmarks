import type Anthropic from "@anthropic-ai/sdk";
import type { Property } from "../../src/types.js";
import type { FetchedSource } from "./fetch-source.js";

export interface ParsedResponse {
  value: string;
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
    citations.push({
      cited_text: c.cited_text,
      source: fetched[c.document_index]?.sourceUrl ?? fetched[0].sourceUrl,
    });
  }

  const input = (toolUse.input ?? {}) as { value?: unknown; insufficient_data?: boolean };
  const value = Array.isArray(input.value)
    ? JSON.stringify(input.value)
    : typeof input.value === "string"
      ? input.value
      : undefined;
  if (input.insufficient_data || !value) return { value: "INSUFFICIENT_DATA", notes, citations };
  return { value, notes, citations };
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
