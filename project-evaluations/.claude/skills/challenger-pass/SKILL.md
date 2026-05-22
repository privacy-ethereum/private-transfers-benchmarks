---
name: challenger-pass
description: Devil's-advocate review pass over a protocol evaluation. For each property, a fresh sub-agent argues the closest counter-value to surface anchoring failures the same-session reviewer might have missed. Runs as Phase C.5 of /evaluate-protocol, between the first-pass review (Phase C) and the auto-patch phase (Phase D).
---

# Challenger Pass

A targeted devil's-advocate review. Phase C catches rule violations against the existing value. Phase C.5 challenges the value itself — for each property, what is the strongest case for the closest other enum option, and is any of that case substantiated by the cited sources?

## Arguments

The protocol id is passed as an argument (e.g. `/challenger-pass railgun`). An optional `--only "A,B"` filter restricts the pass to the named properties.

## Instructions

1. **Load the evaluation.** Read `src/data/evaluations/{protocol}.json`.

2. **Load the schema.** Read `src/data/schema.ts` for `PROPERTY_DEFINITIONS`. For each property, identify the `options` enum.

3. **Spawn the challenger sub-agent.** Use `Agent` with `general-purpose` for a fresh context. Pass:
   - The evaluation JSON path.
   - The schema path.
   - The path to `scripts/.source-cache/{protocol}.json` (URL → source text) for cited-source verification.
   - The instruction: **"For each property in the evaluation, identify the closest counter-value in the property's `options` (e.g. value=Single admin → counter Multi-sig or DAO; value=Yes → counter Unlinkability or No). Argue the strongest case for that counter-value drawing on the property's `notes` and `cited_text` spans plus the source cache. Return a Markdown table `Property | Current value | Counter-value | Counter-argument summary (1–2 sentences) | Has source support? (Y/N)`. Include only rows where the counter-argument has at least partial support in the cited sources or in adjacent uncited context on the same source pages — skip rows where the counter-argument is purely speculative with no anchor in the evidence."**

4. **Return the sub-agent's table verbatim** to the calling phase (Phase D of `/evaluate-protocol`). Do NOT auto-patch the evaluation; the rows are signals for human review or for Phase D's evaluation-bug handler.

## Output Format

```
## Challenger pass — {protocol}

| Property | Current value | Counter-value | Counter-argument | Has source support? |
| -------- | ------------- | ------------- | ---------------- | ------------------- |
```

If the sub-agent finds nothing worth surfacing, emit one line: `No challenger-pass candidates surfaced.`

## Why this design

Same-session review anchors on the value already written. A fresh sub-agent that is asked to argue the OTHER enum option treats the current value as the hypothesis to disprove rather than the answer to verify. The mental task is different from rule-checking, and catches anchoring failures Phase C and Phase E miss. Rows where the counter-argument has source support are exactly the cases where the current value may be wrong despite passing every rule.

## Failure modes

- **Sub-agent argues a counter-value with zero source anchor for every property** — the prompt was too loose. Re-spawn with stricter instructions: every counter-argument must point at a specific cited span or a quoted passage from the cached source.
- **Sub-agent returns a table identical to Phase C's findings** — the agent re-did the first-pass review instead of the counter-value argument. Re-spawn emphasising the counter-value framing.
