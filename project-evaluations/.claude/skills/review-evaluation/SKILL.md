---
name: review-evaluation
description: Review a protocol evaluation for accuracy, consistency, and rule compliance. Use when asked to review an evaluation.
---

# Review Evaluation

Review the specified protocol evaluation against the single-source-of-truth rules in `scripts/research-prompts.ts`, web sources, and schema constraints.

## Arguments

The protocol name is passed as an argument (e.g. `/review-evaluation railgun`). An optional `--only "A,B"` filter restricts the review to the named properties.

## Instructions

1. **Load the ruleset.** Read `scripts/research-prompts.ts`. The review uses these exported constants:
   - `WRITING_RULES` — writing quality checks (every sentence relevant, no marketing language, paraphrase sources, etc.)
   - `CROSS_CHECK_RULES` — internal consistency between properties (compliance, viewing key, multi-select).
   - `VALUE_FORMAT_RULES` — schema enum, multi-select array shape, factual accuracy on deployment claims.
   - `SOURCE_SELECTION_RULES` — acceptable URL shapes.
   - `REVIEW_ONLY_RULES` — URL verification, TODO resolution, "we assume" flagging, L2BEAT reference, "how but not what" pattern.
   - `PROPERTY_RULES` — a record keyed by property name with per-property guidance; look up the entry for each property you are reviewing.
     Quote the rule text (or the numbered bullet) when flagging a violation so the fix is traceable.

2. **Load the evaluation.** Read `src/data/evaluations/{protocol}.json`.

3. **Load the schema.** Read `src/data/schema.ts` for `PROPERTY_DEFINITIONS` — use the `options` array to validate values against the schema enum.

4. **Collect source URLs.** Gather every unique `url` (or `citations[].source`) across properties. Fetch each unique URL once with WebFetch so you can verify notes against content.

5. **For each property** (filtered by `--only` if supplied):
   - Apply `WRITING_RULES`, `VALUE_FORMAT_RULES`, `SOURCE_SELECTION_RULES`, `REVIEW_ONLY_RULES`, and — if present — the matching entry in `PROPERTY_RULES`.
   - Flag violations by quoting the relevant rule. Example: `[VALUE_FORMAT_RULES rule 1] value "Unknown" is not in options: [...]`.
   - For properties without a URL or citations, do a targeted web search to verify the value. Group related properties into single searches (e.g. "{protocol} privacy features" to cover Confidentiality + Anonymity + Asset privacy together).

6. **Cross-check consistency** across properties using `CROSS_CHECK_RULES`:
   - Compliance cross-check — all four compliance properties align.
   - Viewing-key cross-check — viewing entity=["None"] ⇒ viewing control="None".
   - No contradictory multi-select — no multi-select contains conflicting values.
   - Contract-level compliance audit — for smart-contract protocols, look at the contract repo for proxies, onlyOwner gates, and blocklist hooks.
   - L1 protocols should have `N/A` for deposit/withdraw time and escape hatch.

7. **Resolve TODOs** per `REVIEW_ONLY_RULES` rule 2.

## Output Format

### Summary

`{protocol}: X issues found across Y properties reviewed`

### Issues table

| Property | Rule | Current value | Suggested value | Reason |
| -------- | ---- | ------------- | --------------- | ------ |

Cite the rule block and bullet number (e.g. `WRITING_RULES #7`, or `PROPERTY_RULES["Open source"]`) so the fix is traceable.

### Rule gap candidates

If you observe a recurring failure pattern that no existing rule in `scripts/research-prompts.ts` catches, list each gap as a one-line description at the end under `Rule gap candidates`. Do not edit `research-prompts.ts` yourself — that is the job of `/evaluate-protocol`'s auto-patch pass.
