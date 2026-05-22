---
name: review-evaluation
description: Review a protocol evaluation for accuracy, consistency, and rule compliance. Use when asked to review an evaluation.
---

# Review Evaluation

Review the specified protocol evaluation against the single-source-of-truth rules in `scripts/research-prompts.ts`, web sources, and schema constraints.

## Arguments

The protocol name is passed as an argument (e.g. `/review-evaluation railgun`). An optional `--only "A,B"` filter restricts the review to the named properties.

## Instructions

1. **Load the ruleset.** Read `scripts/research-prompts.ts` for the cross-cutting rule blocks:
   - `WRITING_RULES` — writing quality checks (every sentence relevant, no marketing language, paraphrase sources, etc.)
   - `CROSS_CHECK_RULES` — internal consistency between properties (compliance, viewing key, multi-select).
   - `VALUE_FORMAT_RULES` — schema enum, multi-select array shape, factual accuracy on deployment claims.
   - `SOURCE_SELECTION_RULES` — acceptable URL shapes.
   - `REVIEW_ONLY_RULES` — URL verification, TODO resolution, "we assume" flagging, L2BEAT reference, "how but not what" pattern.

   Per-property rules live in `.claude/skills/property-rules-{group}/SKILL.md` (groups: privacy, compliance, trust, cryptography, state-model, timing, composability). Invoke the relevant per-group skill when reviewing a property in that group, or read the SKILL.md directly. Quote the rule text (or the property name) when flagging a violation so the fix is traceable.

2. **Load the evaluation.** Read `src/data/evaluations/{protocol}.json`.

3. **Load the schema.** Read `src/data/schema.ts` for `PROPERTY_DEFINITIONS` — use the `options` array to validate values against the schema enum.

4. **Collect source URLs.** Gather every unique `citations[].source` across properties. For each unique source, prefer the local snapshot keyed by URL in `scripts/.source-cache/{protocol}.json` if present (fresher than re-fetching, and the citation_text was extracted from it); fall back to WebFetch when no cached copy is available.

5. **For each property** (filtered by `--only` if supplied):
   - Apply `WRITING_RULES`, `VALUE_FORMAT_RULES`, `SOURCE_SELECTION_RULES`, `REVIEW_ONLY_RULES`, and — if the property is in a group with a rules skill — the relevant entry from `.claude/skills/property-rules-{group}/SKILL.md`.
   - Flag violations by quoting the relevant rule. Example: `[VALUE_FORMAT_RULES rule 1] value "Unknown" is not in options: [...]`.
   - **Citation-text verification:** for every full citation (`{cited_text, source, ...}`), confirm that `cited_text` appears in the source content (cached snapshot first, live fetch fallback). Mismatches are flagged but the citation stays unless explicitly judged wrong.
   - **Conservative-keep policy:** never auto-remove a citation. If a citation's `cited_text` is no longer referenced by the (possibly rewritten) notes, prefer rewriting the notes to use the cited evidence over dropping the citation. Only flag for human review when truly orphaned, and even then bias toward keeping. See `REVIEW_ONLY_RULES #6`.
   - For properties without citations, do a targeted web search to verify the value. Group related properties into single searches (e.g. "{protocol} privacy features" to cover Confidentiality + Anonymity + Asset privacy together).

6. **Citation-strictness pass (sub-agent).** Spawn a fresh `Agent` with `general-purpose` whose only job is to map each property's load-bearing factual claims to its citation `cited_text` spans (no other rule-checking). Give the agent: the path to `src/data/evaluations/{protocol}.json`, the path to `scripts/.source-cache/{protocol}.json` (URL → source text), and the patterns below. Ask it to return a Markdown table (`Property | Claim | Supported? (Y/N) | Suggested action`) and nothing else. Merge that table into the issues table from step 5 — each unsupported claim is a row whose suggested action is either reword-to-match-citation OR set `needsResearchReview` to a reason string naming the unsupported claim (per `REVIEW_ONLY_RULES #7` and `#12`).

   **Patterns the sub-agent must flag** (any load-bearing claim in notes not directly substantiated by one of the property's `cited_text` spans, paraphrased OK but the supporting clause must be present, not adjacent context):
   - Specific operation enumerations ("transfers, mints, burns, wrap, unwrap")
   - Internal subsystem / function names ("UUPS proxy", "setUpgradeController()", "ShieldingService")
   - Inferred consequences phrased as fact ("so the verifier is not immutable", "operator can inspect user transactions")
   - Self-hosted / alternative-deployment claims when only the default flow is cited
   - Quantitative specifics ("15-45 minute window", "$10k liquidity")
   - Specific dates ("since November 2025") not in any cited span

7. **Cross-check consistency** across properties using `CROSS_CHECK_RULES`:
   - Compliance cross-check — all four compliance properties align.
   - Viewing-key cross-check — viewing entity=["None"] ⇒ viewing control="None".
   - No contradictory multi-select — no multi-select contains conflicting values.
   - Contract-level compliance audit — for smart-contract protocols, look at the contract repo for proxies, onlyOwner gates, and blocklist hooks.
   - L1 protocols should have `N/A` for deposit/withdraw time and escape hatch.

8. **Resolve TODOs** per `REVIEW_ONLY_RULES` rule 2.

9. **Run the lint pass.** Execute `pnpm run lint:evaluations` and incorporate any flagged issues into the issues table. The linter catches mechanical patterns (` ,` / ` .`, file names in notes, `is Yes`/`is No` value-restatement, hedge phrases, GitHub URLs alongside canonical docs, bare URLs in notes) that the reviewer should not have to spot manually.

## Per-property checklist

For each property, tick every box. Any unticked box becomes an issues-table row. Do not declare a property "reviewed" until every applicable box is ticked or explicitly justified.

```
- [ ] Value is in the schema enum (per VALUE_FORMAT_RULES #1, options from src/data/schema.ts)
- [ ] Value is the strongest applicable enum (e.g. Anonymity = Yes preferred over Unlinkability when full anonymity holds)
- [ ] Notes answer "what" the property is, not just describe "how" the mechanism works (REVIEW_ONLY_RULES #4)
- [ ] Notes do not restate the value (WRITING_RULES #7) — no "is Yes for...", "value is...", "is set to..."
- [ ] Notes do not contain implementation artefacts (file names like *.sol, *.circom, var names, line numbers) unless property is Upgradeability or Open source (WRITING_RULES #9)
- [ ] Notes do not contain bare URLs or markdown links (WRITING_RULES #16) — citations live in the citations array, not in prose
- [ ] Notes do not contain hedge phrases ("we assume", "the document", "indicates", "confirms")
- [ ] Per-group rule applied: if the property is in privacy / compliance / trust / cryptography / state-model / timing / composability, the matching .claude/skills/property-rules-{group}/SKILL.md entry has been read and applied
- [ ] Citation-text verification: every ApiCitation's cited_text appears in the source content (cached snapshot or live fetch)
- [ ] Citations preserved (default: keep) — REVIEW_ONLY_RULES #6
- [ ] Cross-property consistency: compliance quartet aligns (CROSS_CHECK_RULES #1), viewing-key quartet aligns (CROSS_CHECK_RULES #3), no multi-select contradictions (#4), contract-level compliance audit done if smart-contract protocol (#5)
- [ ] needsResearchReview is a non-empty reason string (not a boolean, not a vague placeholder) that names the specific open factual question per REVIEW_ONLY_RULES #7 — set/kept only when an edit leaves a factual question unresolved (an uncross-checked value change, an ungrounded factual claim in the notes, an unresolved TODO, or an unreconcilable citation); cleared (field deleted) when value+notes check out and citations substantiate them; cosmetic cleanup never flags; substantive corrections that ARE grounded carry a manual { source } citation and stay unflagged
```

## Output Format

### Summary

`{protocol}: X issues found across Y properties reviewed`

### Issues table

| Property | Rule | Current value | Suggested value | Reason |
| -------- | ---- | ------------- | --------------- | ------ |

Cite the rule block and bullet number (e.g. `WRITING_RULES #7`, or `property-rules-trust["Open source"]`) so the fix is traceable.

### Rule gap candidates

If you observe a recurring failure pattern that no existing rule catches, list each gap as a one-line description at the end under `Rule gap candidates`. Note whether the gap belongs in a cross-cutting block (`scripts/research-prompts.ts`) or in a per-group property-rules skill (`.claude/skills/property-rules-{group}/SKILL.md`). Do not edit either yourself — that is the job of `/evaluate-protocol`'s auto-patch pass.
