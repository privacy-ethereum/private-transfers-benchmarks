import type Anthropic from "@anthropic-ai/sdk";
import type { PropertyContent } from "../../src/types.js";
import { buildEvaluationPrompt } from "../research-prompts.js";
import type { FetchedSource } from "./fetch-source.js";

/**
 * Call the Anthropic citations API for one property. Asks Claude for a typed answer
 * (tool_use) AND prose-with-citations (text blocks) in ONE call: tool_use carries a
 * structured value but no citations; text blocks carry citations but are free-form prose.
 * We need both and stitch them together in `parseCitationsResponse`.
 */
export async function callCitations(
  client: Anthropic,
  property: PropertyContent,
  protocolName: string,
  researchSummary: string,
  fetched: FetchedSource[],
  context: string | undefined,
): Promise<Anthropic.Message> {
  const stringSchema = property.options
    ? { type: "string" as const, enum: [...property.options] }
    : { type: "string" as const };
  const valueSchema =
    property.inputType === "multi-select" ? { type: "array" as const, items: stringSchema } : stringSchema;
  const tool: Anthropic.Tool = {
    name: "record_evaluation",
    description: "Record the final evaluation. Call exactly once after writing your prose answer.",
    input_schema: {
      type: "object",
      properties: { value: valueSchema, insufficient_data: { type: "boolean" } },
      required: [],
    },
  };

  const documentBlocks = fetched.map((f) => ({
    type: "document" as const,
    source: { type: "text" as const, media_type: "text/plain" as const, data: f.text },
    title: f.sourceUrl,
    citations: { enabled: true },
    cache_control: { type: "ephemeral" as const },
  }));

  return client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    tools: [tool],
    tool_choice: { type: "auto", disable_parallel_tool_use: true },
    messages: [
      {
        role: "user",
        content: [
          ...documentBlocks,
          { type: "text", text: buildEvaluationPrompt(property, protocolName, researchSummary, context) },
        ],
      },
    ],
  });
}
