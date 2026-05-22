---
name: review-evaluation-final
description: Independent second-pass review of a protocol evaluation. Run AFTER /review-evaluation has produced its first report. This skill spawns a fresh subagent with no exposure to the first review's findings, has it review the same evaluation from scratch against the same rules, and diffs the two reports so anchoring bias from the first pass is surfaced. Use when an evaluation needs higher-confidence sign-off, especially before merging or shipping.
---

# Review Evaluation — Final (independent second pass)

The first-pass review (`/review-evaluation {protocol}`) catches obvious issues but is run in the same session that authored or edited the evaluation, so it anchors on whatever the evaluation already says. This skill runs a fresh, independent review whose only job is to find what the first pass missed.

## Arguments

The protocol name is passed as an argument (e.g. `/review-evaluation-final railgun`). An optional `--only "A,B"` filter restricts the second pass to the named properties.

## Instructions

1. **Confirm a first-pass report exists.** Look for the most recent issues table emitted by `/review-evaluation {protocol}` in the conversation, or in `.claude/review-reports/{protocol}-{date}.md` if `/evaluate-protocol` ran the full pipeline. If no first-pass report exists, stop and tell the user to run `/review-evaluation {protocol}` first — this skill is a second pass, not a first. Note: when invoked as Phase E of `/evaluate-protocol`, the evaluation JSON has already been patched by Phase D — the subagent reviews the file as it currently stands on disk (the final state), which is the intended behaviour.

2. **Spawn an independent review subagent.** Use the `Agent` tool (with no `subagent_type`, so it's a fork sharing prompt-cache, OR with `general-purpose` if a fully fresh context is preferred). The agent prompt MUST:
   - Tell the subagent to follow `/review-evaluation {protocol}` end-to-end against the SAME rules.
   - Give it the path to the evaluation JSON, the rules in `scripts/research-prompts.ts`, the per-group property-rules skills under `.claude/skills/property-rules-*`, and the source-text cache at `scripts/.source-cache/{protocol}.json` (URL → text).
   - **NOT include the first review's report or any conclusions from it.** Anchoring is the failure mode this skill exists to defeat — the subagent must see only the rules + the file + the sources, and form its own opinions.
   - Ask the subagent to return its issues table in the same format as `/review-evaluation`, plus a Rule gap candidates section.

3. **Wait for the subagent to return.** Do not race or pre-summarise. Treat the returned report as Report B.

4. **Diff Report A (first pass) against Report B (second pass).**
   - **Agreement set:** issues that both reports flag for the same property/rule. High confidence — these are the real issues.
   - **B-only set:** issues only the second pass flagged. The first pass may have anchored or missed; investigate each.
   - **A-only set:** issues only the first pass flagged but the second pass disagreed with. Either the first pass over-flagged, or the second pass missed; investigate each.
   - **Disagreement set:** same property flagged by both passes but with different rules / different fixes. The disagreement is itself a signal — surface for human eyes.

5. **Output the merged report.** Three sections:

   ```
   ## Agreement (high confidence — fix these)
   | Property | Rule | Current | Suggested | Reason |

   ## Second-pass-only (likely first-pass anchoring)
   | Property | Rule | Current | Suggested | Reason |

   ## First-pass-only (review for over-flagging or second-pass miss)
   | Property | Rule | Current | Suggested | Reason |

   ## Disagreement (different rules / different fixes — needs human eyes)
   | Property | Pass A's rule + suggestion | Pass B's rule + suggestion |
   ```

6. **Do not auto-patch the evaluation JSON yourself.** This skill produces the merged report only. When invoked as Phase E of `/evaluate-protocol`, that wrapper applies the Agreement set and any clear Second-pass-only items to the evaluation JSON and surfaces the Disagreement set for human review — but that patching happens in the wrapper, not here. When invoked standalone, the merged report is the deliverable; the user decides what to apply.

## Why this design

The dominant failure mode for evaluations is anchoring — once a property is written, both write-time and same-session review-time read it through the same lens. A fresh subagent has no such lens. Reports A and B will agree on obvious issues; the disagreements are exactly the cases where one pass missed something. The merged report concentrates reviewer attention on the high-signal rows (B-only and Disagreement), which are the ones most likely to catch the kind of error this whole pipeline is designed to prevent.

## Failure modes

- **Subagent returns the same report verbatim.** The agent prompt was leaky — it saw Report A in some form. Re-spawn with stricter instructions to ignore prior conclusions, or with `subagent_type: general-purpose` for a fully fresh context.
- **Subagent's report is empty.** The agent didn't actually run the review. Inspect its output for tool errors and re-spawn.
- **Disagreement set is large and chaotic.** The two passes are using rules differently — likely a rules-base ambiguity. Surface to user for clarification rather than guessing.
