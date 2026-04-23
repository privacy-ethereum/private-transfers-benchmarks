---
name: evaluate-protocol
description: End-to-end evaluation pipeline for a single protocol — discover sources, run the citations research script, review the output against rules, and auto-patch scripts/research-prompts.ts with any new gaps surfaced by review.
---

# Evaluate Protocol

Wrapper skill that chains the full evaluation pipeline in one command and auto-patches the ruleset based on what review uncovers.

## Arguments

- `<protocol>` — required. Protocol id from `scripts/research-config.ts`.
- `--only "A,B"` — optional. Restrict every phase to the named properties.

## Task tracking (mandatory)

At the start, create one task per phase via `TaskCreate` (5 tasks: A, B, C, D, E). Mark each task `in_progress` immediately before starting that phase's work, and `completed` immediately after the phase's deliverable is produced — _before_ writing any commentary or starting the next phase.

**Common bug to avoid:** when a phase invokes a sub-skill (Phase A → `/research-sources`, Phase C → `/review-evaluation`), the sub-skill's return is the phase's deliverable. Do not interpret the sub-skill's output as "review continues" — it is "phase done". Mark the task `completed` _before_ you write your synthesis or proceed to the next phase. If you find yourself summarising review findings while a Phase C task is still `in_progress`, stop and update it.

## Phases

### Phase A — Sources

Invoke the `/research-sources <protocol> [--only …]` skill. This writes `scripts/research-cache/{id}.json`. Stop if the skill fails; print the error.

**Phase A is complete when:** `scripts/research-cache/{id}.json` exists with one entry per non-skipped property. Mark the task `completed` and move to Phase B.

### Phase B — Citations research

Run the API-backed citations script:

```
pnpm run research <protocol> [--only "A,B"]
```

The script reads the cache from Phase A and writes/updates `src/data/evaluations/{id}.json`. Stop and surface the error if the script exits non-zero.

**Phase B is complete when:** the script exits 0 and `src/data/evaluations/{id}.json` has a value (or `INSUFFICIENT_DATA`) for every non-skipped property. Mark the task `completed` and move to Phase C.

### Phase C — Review

Invoke `/review-evaluation <protocol> [--only …]`. Capture its structured output: the issues table plus the "Rule gap candidates" section.

**Phase C is complete the moment `/review-evaluation` returns its issues table.** This is the most-missed completion boundary in this skill. Specifically:

1. The sub-skill's response _is_ the deliverable — there is no "additional review" step to perform.
2. Mark the Phase C task `completed` _before_ writing any synthesis, before invoking Phase D, before any other tool call.
3. If you are about to write "moving to Phase D" or "now applying the edits" while the Phase C task is still `in_progress`, stop and update the task first.

### Phase D — Auto-patch rules

For each item in the review output:

1. **Evaluation bug** — a property value or note that violates an existing rule. Do NOT edit `research-prompts.ts`. Edit `src/data/evaluations/{id}.json` directly: update the property `value`, `notes`, and set `needsResearchReview: true` if verification was not completed.

2. **Rule gap** — review flagged a failure pattern with no matching existing rule. Patch `scripts/research-prompts.ts`:
   - **Before adding a new bullet, read the entire target rule block and ALL adjacent blocks.** Look for a rule that partially covers the gap. If one exists:
     - **Strengthen or extend the existing rule** rather than adding a new one (e.g. broaden the scope, add a clarifying clause, add the new failure mode to the existing list).
     - If the existing rule is close but phrased differently, **edit it in place** so the one rule covers both the old and new case.
     - Only add a new bullet when no existing rule is close — i.e. the new failure mode is orthogonal to everything already written.
   - **Check for cross-block duplication too.** If the same idea shows up in `WRITING_RULES` and `VALUE_FORMAT_RULES`, consolidate to one block (the most specific one) and delete the duplicate.
   - When a new bullet really is needed, pick the right block:
     - If the gap is tied to a specific property, add or extend the entry for that property in `PROPERTY_RULES`. Use the exact property name from `schema.ts` as the key.
     - If the gap is a generic writing issue, append a new numbered bullet to the end of `WRITING_RULES`.
     - If it's a cross-check between properties, append to `CROSS_CHECK_RULES`.
     - If it's a URL-selection issue, append to `SOURCE_SELECTION_RULES`.
     - If it's a value-format issue (enum, JSON shape, factual accuracy), append to `VALUE_FORMAT_RULES`.
     - If it only applies at review time (post-hoc verification with no write-time analogue), append to `REVIEW_ONLY_RULES`.
   - Match the imperative style and bullet format of the surrounding rules. Apply the patch directly — no dry run.
   - **Goal: keep the rule base small.** Strengthening beats adding. Merging beats both. If Phase D ends with a net-positive rule count, confirm each new bullet is genuinely new.

After patching, run `pnpm run build` from `project-evaluations/`. If it fails, read the error, fix `research-prompts.ts`, and retry.

**Phase D is complete when:** every issue from Phase C's table has been addressed (edited in `{id}.json` or written into `research-prompts.ts`), every edited property has `needsResearchReview: true`, and `pnpm run build` passes. Mark the task `completed` and move to Phase E.

### Phase E — Report

Write a report to `project-evaluations/.claude/review-reports/{id}-{YYYY-MM-DD}.md` containing:

- Phase A result: cache file path + property count.
- Phase B result: evaluation diff summary (which properties changed value).
- Phase C result: full issues table from review.
- Phase D result: list of evaluation edits and new rule ids added to `rules.ts`.
- Open items: any property still flagged `needsResearchReview: true` or missing a source.

**Phase E is complete when:** the report file exists at `.claude/review-reports/{id}-{date}.md` with all five sections filled in. Mark the task `completed`.

## Failure modes

- **Cache missing after Phase A** — the `/research-sources` skill silently returned. Inspect its output; do not proceed to Phase B.
- **Build fails after Phase D** — a generated rule broke TypeScript. Read the error, edit `rules.ts`, rebuild. Do not leave the repo in a broken state.
- **New rule duplicates an existing id** — choose a more specific id. Never overwrite an existing rule in Phase D; overwriting rules must be a human-driven action.

## Verification

After all phases complete, confirm:

- `scripts/research-cache/{id}.json` exists and has entries for every non-skipped property.
- `src/data/evaluations/{id}.json` is valid JSON and every property has either a value or `needsResearchReview: true`.
- `pnpm run build` passes.
- The review report exists at `project-evaluations/.claude/review-reports/{id}-{date}.md`.
