---
name: property-rules-timing
description: Per-property guidance for timing-related properties — Time-to-finality, Deposit time, Withdraw time, and Implementation maturity. Invoke when evaluating, reviewing, or editing notes/values for any of these. Cross-cutting rules in scripts/research-prompts.ts still apply on top.
---

# Timing property rules

Apply the rule for the property currently being evaluated. Cross-cutting rules in `scripts/research-prompts.ts` still apply.

## Time-to-finality

For pure application-layer contracts deployed on an existing chain (no protocol-level settlement step of their own), the value is N/A and finality is inherited from the underlying chain. List the deployed networks in the notes.

For zkRollups, validity-proof rollups, and any L2/L3 with its own settlement cadence — an Aztec transaction, for example, is not final until its epoch proof is verified on L1 — the value is the worst-case time to L1 verification (in seconds): one epoch length is the usual upper bound for the rollup's own delay. Add Ethereum L1 finality (~13 minutes) as a separate note since the proof transaction's own inclusion also needs to finalise. Use N/A only when the protocol genuinely has no settlement step distinct from its host chain.

## Deposit time

For L1 protocols without a distinct deposit concept, use N/A. For an application-layer protocol whose deposit (shield, burn, wrap, encrypt) is an ordinary on-chain transaction with no protocol-imposed waiting period — no queue, challenge window, or time-lock — use 0; host-chain block or settlement latency is not a deposit waiting period. For an off-chain routing or aggregator service with no separate deposit-then-withdraw step (deposit, route, and deliver happen in one flow), use N/A and say in notes the property does not really apply (VALUE_FORMAT_RULES #3).

## Withdraw time

For L1 protocols without a distinct withdraw concept, use N/A. For an application-layer protocol whose withdraw (unshield, redeem, claim, decrypt) is an ordinary on-chain transaction with no protocol-imposed waiting period — no queue, exit or challenge window, or time-lock — use 0; host-chain block or settlement latency is not a withdraw waiting period. For an off-chain routing or aggregator service with no separate deposit-then-withdraw step, use N/A and say in notes the property does not really apply (VALUE_FORMAT_RULES #3).

## Implementation maturity

Verify mainnet deployment per VALUE_FORMAT_RULES #1. Do not state a specific launch month or date without a citation (block-explorer first transaction, dated announcement post, audit report) — if you cannot source it, give the maturity bracket and say the exact date is not documented rather than asserting one. For non-contract services (routing aggregators, hosted privacy layers), measure maturity from documented service launch / public availability (uptime), not from a contract deployment, and say so in the notes.

Staged launches. When a protocol has a multi-phase launch — a coordination / governance / settlement chain goes live before user-facing transfers are enabled (e.g. Aztec Ignition Chain Nov 2025 as the coordination layer vs Alpha as the user-facing execution layer in 2026) — measure tenure from the date user-facing transfers actually became possible, not from the earliest coordination-layer go-live. If only the earlier coordination-layer date is in cited spans and the user-facing date is not, you may still use the earlier date as a lower bound for the tier but the notes must distinguish what each date covers; do NOT call the coordination-layer launch "mainnet" if it did not yet process user transfers.

Typed citation pair. Implementation maturity carries at least two citations that together prove the deployment date:

1. **Docs / announcement citation** — `source` is the protocol's own docs page or dated announcement that names the deployment. When the protocol deploys a contract on an existing chain, this citation carries `contract_address` (the hex / program-id string that the docs name as the canonical deployment). When the protocol is itself a chain (L1, L2, alt-L1), `contract_address` is omitted — the citation just proves "this is the announcement of the deployment".
2. **Explorer / first-tx citation** — `source` is the chain explorer's address page (for contract protocols, e.g. `etherscan.io/address/0x…`) OR the explorer's first-block / chain-launch page (for L1s and L2s). This citation carries `date: "YYYY-MM-DD"` (the deployment / first-tx / chain-genesis date) AND, when applicable, the same `contract_address` as the docs citation so reviewers can trace that the same address shows in both.

Reviewer flow: click the docs citation → confirm the protocol claims this is their deployment; click the explorer citation → confirm the explorer page shows that address (or the chain genesis) on `date`. If `contract_address` is set, the same hex string must appear in both citations' `source` URLs (mechanical check at review time, not enforced by lint).

For protocols without a usable chain explorer (some alt-L1s, off-chain services), set `needsResearchReview` naming the missing dated-evidence channel rather than inventing one — do not fall back to bare prose citations to satisfy the typed-date requirement.
