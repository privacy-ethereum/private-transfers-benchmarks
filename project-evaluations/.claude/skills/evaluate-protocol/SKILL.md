---
name: evaluate-protocol
description: End-to-end evaluation pipeline for a single protocol — discover sources, run the citations research script, review the output against rules, run an independent second-pass review, and report, applying the qualifying rule-gap improvements to the rule files and leaving them uncommitted for human review.
---

# Evaluate Protocol

Wrapper skill that chains the full evaluation pipeline in one command. Rule-gap candidates surfaced by review that clear the Phase E.5 bar are applied to the rule files in that phase and left uncommitted for a human to review and commit — the pipeline edits rule files but never commits them.

## Arguments

- `<protocol>` — required. Protocol id from `scripts/research-config.ts`.
- `--only "A,B"` — optional. Restrict every phase to the named properties.

## Task tracking (mandatory)

At the start, create one task per phase via `TaskCreate` (8 tasks: A, B, C, C.5, D, E, E.5, F). Mark each task `in_progress` immediately before starting that phase's work, and `completed` immediately after the phase's deliverable is produced — _before_ writing any commentary or starting the next phase.

**Common bug to avoid:** when a phase invokes a sub-skill (Phase A → `/research-sources`, Phase C → `/review-evaluation`, Phase C.5 → `/challenger-pass`, Phase E → `/review-evaluation-final`), the sub-skill's return is the phase's deliverable. Do not interpret the sub-skill's output as "review continues" — it is "phase done". Mark the task `completed` _before_ you write your synthesis or proceed to the next phase. If you find yourself summarising review findings while a Phase C, C.5, or Phase E task is still `in_progress`, stop and update it.

## Phases

### Phase A — Sources

Invoke the `/research-sources <protocol> [--only …]` skill. This writes `scripts/research-cache/{id}.json`. Stop if the skill fails; print the error.

**Phase A halt-and-ask safeguard.** After the cache is written, count properties with `urls: []`. If more than 25% of in-scope properties have no URLs, STOP and surface the count to the user before proceeding to Phase B. A high urls-empty rate signals the docs probe failed (e.g. only the root was checked, sitemap missed) — running Phases B/C/D on top of a hollow cache cascades flawed citations into review and forces a full redo. Ask the user whether to re-run research-sources with broader probing or proceed with the gap.

**Phase A is complete when:** `scripts/research-cache/{id}.json` exists with one entry per non-skipped property AND <25% have `urls: []` (or the user has explicitly accepted the gap). Mark the task `completed` and move to Phase B.

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
2. Mark the Phase C task `completed` _before_ writing any synthesis, before invoking Phase C.5, before any other tool call.
3. If you are about to write "moving to Phase C.5" or "now applying the edits" while the Phase C task is still `in_progress`, stop and update the task first.

### Phase C.5 — Devil's-advocate challenger pass

Invoke `/challenger-pass <protocol> [--only …]`. The skill spawns a fresh sub-agent that, for each property, argues the closest counter-value and surfaces rows where the counter-argument has at least partial support in the cited sources. The returned table is the deliverable.

**Phase C.5 is complete when `/challenger-pass` returns its table** (or `No challenger-pass candidates surfaced.`). Mark the task `completed`. Each surfaced row joins the Phase C issues list as a candidate evaluation-bug for Phase D — the row's "Counter-argument" is the suggested-value hint; Phase D's evaluation-bug handler decides whether to update value/notes and whether to flag `needsResearchReview`.

### Phase D — Auto-patch rules

**Edit tool only — no Write rewrites.** Edit `src/data/evaluations/{id}.json` using the Edit tool with targeted `old_string`/`new_string` pairs. Do NOT use the Write tool to rewrite the whole file in one shot. Write produces paraphrased content (especially in `cited_text` fields) that doesn't match the source cache and gets caught by the cited-text-verbatim lint at best, slips through at worst. If a Phase D pass touches 50+ properties, that's 50+ Edit calls — accept the verbosity. Targeted Edits also let the AI verify each `old_string` exactly matches the file before changing, which prevents the silent paraphrasing the Write tool enables.

For each item in the review output:

1. **Evaluation bug** — a property value or note that violates an existing rule. Do NOT edit `research-prompts.ts`. Edit `src/data/evaluations/{id}.json` directly: update the property `value` and `notes`, and set `needsResearchReview` to a reason string only if the edit leaves factual uncertainty per `REVIEW_ONLY_RULES #7` (cosmetic / stylistic cleanup never flags; a substantive correction that is fully grounded in a cited source also does not flag — the manual `{ source }` citation is the verification).

   **Before setting `needsResearchReview`, answer this checklist:**
   1. What specific factual question is still unresolved after this edit? (If you can't name one, do not set the flag. If you can, that sentence IS the reason string.)
   2. Is that question something a human can resolve by reading a public source, or is it a judgement call? (Public-source-resolvable = flag. Judgement call = leave unflagged; the edit IS the judgement.)
   3. Is at least one citation on the property substantiating the edited claim? (If yes and #1 is "none", do not set the flag.)
   4. Is the original `needsResearchReview` already set purely because earlier auto-patches set it, but the underlying question is now answered? (If yes, CLEAR the flag — delete the field — do not propagate it forward as a "cleanup pending" marker.)

   The reason string must name the specific open question (e.g. `"on-chain admin slot not classified"`), not a vague placeholder (`"needs review"`, `"TBD"`). The flag is reserved for genuine residual factual uncertainty, not for "I edited this so flag it just in case". Carrying flags forward on resolved properties pollutes the open-items backlog and trains reviewers to ignore the flag.

2. **Rule gap** — review flagged a failure pattern with no matching rule. Do NOT edit any rule file in Phase D. Record the candidate for Phase E.5: the failure pattern, the property it hit, and where a rule would live (which rule block or property-rules group). Phase E.5 decides whether it clears the bar and, if so, applies it — left uncommitted for human approval.

After patching, run `pnpm run build` from `project-evaluations/`. If it fails, read the error, fix `src/data/evaluations/{id}.json`, and retry.

3. **Maturity-date safety net (sub-agent).** If `Implementation maturity` has a value matching tier 3/4/5 (`/^[3-5]\s*:/`), spawn a fresh `Agent` (`general-purpose`) with: the property's `notes`, its `citations`, and the snapshot cache at `scripts/.source-cache/{id}.json` (URL → text) — instruct the agent to look up each `citations[].source` URL in that map. Ask the agent to confirm whether the cited sources actually contain a deployment date / first-tx date / dated announcement consistent with the chosen tier, and return either `OK` or a one-sentence gap description. If `OK`: nothing to do. If gap: set `needsResearchReview` on the property to a reason string naming the missing date (e.g. `"Tier {N} requires a YYYY date; no dated span found in cited sources for the deployment claim."`). The lint rule `maturity-date-citation` is the cheap first line of defence; this agent is the safety net that catches cases where a year token appears in some unrelated cited_text but the deployment date itself isn't substantiated.

**Phase D is complete when:** every evaluation-bug issue from Phase C's table has been fixed in `{id}.json`, every rule-gap candidate has been recorded for Phase E.5 (not applied), the maturity-date safety net has run if applicable, the `needsResearchReview` reason string on each edited property reflects `REVIEW_ONLY_RULES #7` (kept only on residual factual uncertainty, with a specific reason naming the open question; cleared when the edit resolves the issue with a cited source), and `pnpm run build` passes. Mark the task `completed` and move to Phase E.

### Phase E — Independent second-pass review

Invoke `/review-evaluation-final <protocol> [--only …]`. It spawns a fresh subagent that reviews the **already-patched** `src/data/evaluations/{id}.json` from scratch — with no exposure to Phase C's findings — and returns the merged report (Agreement / Second-pass-only / First-pass-only / Disagreement sets).

Then act on the merged report:

1. **Agreement set and clear Second-pass-only items** (typos, wrong enum, missing category, unsubstantiated claim, etc.) — apply them to `{id}.json` exactly as in Phase D: update `value` / `notes`, and set `needsResearchReview` to a reason string only where the edit leaves factual uncertainty per `REVIEW_ONLY_RULES #7`. Rule gaps surfaced here go to the same destinations as Phase D.
2. **Disagreement set** — do NOT patch. These need human eyes. Carry them into the Phase F report as open items.

After patching, run `pnpm run build`; fix and retry on failure.

**Phase E is complete when:** `/review-evaluation-final` has returned its merged report, the Agreement + clear Second-pass-only items are applied to `{id}.json`, the Disagreement set is recorded for Phase F, and `pnpm run build` passes. Mark the task `completed` and move to Phase E.5.

### Phase E.5 — Improvement integration

Collect the rule-gap candidates recorded across Phases C, C.5, D, and E. Keep only those clearing a high bar:

- **High-impact** — a deterministic lint or cross-check that, had it existed, would have changed a property value this run.
- **Recurring** — the same theme appears in at least 2 review reports across `.claude/review-reports/`.

For each qualifying candidate, APPLY the fix to its destination with the Edit tool — the relevant block in `scripts/research-prompts.ts`, the matching `property-rules-{group}/SKILL.md`, or the lint — and align the current eval if the new rule changes how this protocol should be graded. Be careful: make the smallest correct edit, match the file's existing voice, and never apply a speculative gap (a plausible gap is not the bar). **Leave every applied change uncommitted** — the human reviews and commits it; the pipeline edits rule files but never commits them. If a qualifying change is large, ambiguous, or you are not confident it is correct, record it in the report WITHOUT applying it and flag it for a human to author.

Drop the non-qualifying candidates, recording them as skipped so a later run's recurrence scan can promote them.

**Phase E.5 is complete when:** qualifying candidates are applied (uncommitted) to their destination rule files, the current eval is aligned to any newly-applied rule, and the applied + skipped candidates are written to the report's Improvements section. Mark the task `completed` and move to Phase F.

### Phase F — Report

Write a report to `project-evaluations/.claude/review-reports/{id}-{YYYY-MM-DD}.md` containing:

- Phase A result: cache file path + property count.
- Phase B result: evaluation diff summary (which properties changed value).
- Phase C result: full issues table from the first-pass review.
- Phase C.5 result: challenger-pass table (or "No challenger-pass candidates surfaced.").
- Phase D result: list of evaluation edits and new rule ids added.
- Phase E result: the merged second-pass report (all four sets), and which items were auto-applied.
- `## Improvements`: the Phase E.5 record — qualifying candidates applied this run (uncommitted, pending human approval) plus the skipped ones for the recurrence scan.
- Open items: the Disagreement set, plus any property still carrying a `needsResearchReview` reason string or missing a source.

**Phase F is complete when:** the report file exists at `.claude/review-reports/{id}-{date}.md` with all eight sections filled in. Mark the task `completed`.

### Phase G — Manual-fix tracking (post-merge)

After the user approves the evaluation for commit (i.e. their manual fixes are applied), append a row to `.claude/review-reports/manual-fix-tracking.md` with: protocol id, date range, "All changes" count, "Factual changes" count, pipeline-caught count from Phase C, and a short note. If the user hasn't yet approved/finalised, the wrapper invocation that runs this skill should record the count later — do not skip the row.

Count rule (per the report's header):

- **All changes** = every user-applied manual edit after pipeline completion: grammar/spelling/wording tweaks, factual changes, citation changes, TODOs left in notes, specific terminal instructions to the assistant. Don't double-count — a terminal instruction _about_ a TODO is one change, not two.
- **Factual changes** = subset limited to factual mistakes: wrong values, wrong claims in notes, wrong citations, missing citations, TODOs flagging factual issues, terminal instructions correcting facts. Pure wording/grammar fixes don't count here.

If "All changes" or "Factual changes" is high relative to recent protocols, the row's note should call out which rule / skill / lint addition would have prevented the worst offender — that becomes the next protocol's pre-flight check.

## Failure modes

- **Cache missing after Phase A** — the `/research-sources` skill silently returned. Inspect its output; do not proceed to Phase B.
- **Build fails after Phase D or E** — an applied eval fix broke the JSON/schema. Read the error, fix `src/data/evaluations/{id}.json`, rebuild. Do not leave the repo in a broken state.
- **Phase E subagent returns Phase C's report verbatim** — the subagent prompt leaked the first-pass findings. Re-run `/review-evaluation-final` with stricter prompt isolation (see that skill's failure modes).

## Verification

After all phases complete, confirm:

- `scripts/research-cache/{id}.json` exists and has entries for every non-skipped property.
- `src/data/evaluations/{id}.json` is valid JSON and every property has either a value or a `needsResearchReview` reason string.
- `pnpm run build` passes.
- The review report exists at `project-evaluations/.claude/review-reports/{id}-{date}.md` with the Phase E merged report and the Disagreement set recorded as open items.
