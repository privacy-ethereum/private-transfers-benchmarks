---
name: property-rules-timing
description: Per-property guidance for timing-related properties — Time-to-finality, Deposit time, Withdraw time, and Implementation maturity. Invoke when evaluating, reviewing, or editing notes/values for any of these. Cross-cutting rules in scripts/research-prompts.ts still apply on top.
---

# Timing property rules

Apply the rule for the property currently being evaluated. Cross-cutting rules in `scripts/research-prompts.ts` still apply.

## Time-to-finality

For apps and L2s deployed on other blockchains, the value is N/A and finality is inherited from the underlying chain. List the deployed networks in the notes. Exception: L3s may have their own finality time if their settlement adds delay beyond the underlying L2.

## Deposit time

For L1 protocols without a distinct deposit concept, use N/A. For an application-layer protocol whose deposit (shield, burn, wrap, encrypt) is an ordinary on-chain transaction with no protocol-imposed waiting period — no queue, challenge window, or time-lock — use 0; host-chain block or settlement latency is not a deposit waiting period. For an off-chain routing or aggregator service with no separate deposit-then-withdraw step (deposit, route, and deliver happen in one flow), use N/A and say in notes the property does not really apply (VALUE_FORMAT_RULES #3).

## Withdraw time

For L1 protocols without a distinct withdraw concept, use N/A. For an application-layer protocol whose withdraw (unshield, redeem, claim, decrypt) is an ordinary on-chain transaction with no protocol-imposed waiting period — no queue, exit or challenge window, or time-lock — use 0; host-chain block or settlement latency is not a withdraw waiting period. For an off-chain routing or aggregator service with no separate deposit-then-withdraw step, use N/A and say in notes the property does not really apply (VALUE_FORMAT_RULES #3).

## Implementation maturity

Verify mainnet deployment per VALUE_FORMAT_RULES #1. Do not state a specific launch month or date without a citation (block-explorer first transaction, dated announcement post, audit report) — if you cannot source it, give the maturity bracket and say the exact date is not documented rather than asserting one. For non-contract services (routing aggregators, hosted privacy layers), measure maturity from documented service launch / public availability (uptime), not from a contract deployment, and say so in the notes.
