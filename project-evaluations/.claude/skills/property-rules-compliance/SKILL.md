---
name: property-rules-compliance
description: Per-property guidance for the Compliance property group. Invoke when evaluating, reviewing, or editing notes/values for Type of compliance, Layer of enforcement, Enforcement entities, Point of enforcement, Selective disclosure: viewing entity, or Selective disclosure: viewing control. Loads only compliance-group rules so the active context stays focused. The four-property compliance quartet must be internally consistent (see CROSS_CHECK_RULES in scripts/research-prompts.ts) — that cross-cutting rule is the most important constraint for this group.
---

# Compliance property rules

No property-specific rules in this group yet beyond the cross-cutting ones. The compliance quartet (Layer of enforcement, Enforcement entities, Type of compliance, Point of enforcement) must be internally consistent — see `CROSS_CHECK_RULES #1, #2, #5, #6` in `scripts/research-prompts.ts`.

## Type of compliance

"Proof of innocence (POI) / ASP" covers any **disallowed-set or allowed-set membership check enforced on-chain against a curated list** — whether implemented as a ZK non-membership proof (Privacy Pools-style) OR as a synchronous on-chain blocklist contract lookup (USDC blacklist-style, zERC20 OFAC registry, etc.). The defining feature is that the protocol checks membership/non-membership against a curated set as part of its on-chain transaction validation. The mechanism (ZK proof vs. plain `isBlocked` hook) does not matter for this classification — both are list-based on-chain gates.

"Programmatic policies" covers off-chain or oracle-delivered compliance policies — chain-analytics vendor screens (Chainalysis, TRM, Elliptic) run by a relayer or operator at deposit/withdrawal, Predicate-style attestation oracles that return per-transaction compliance signatures, KYT data feeds applied off-chain, risk-scoring services. The check happens outside the on-chain contract validation. If the screen produces an attestation that the contract accepts, the attestation source is off-chain even though the verification of the attestation is on-chain.

Reserve "Other" for genuinely novel mechanisms, not blocklists or analytics screening. Apply CROSS_CHECK_RULES #1, #2, #5, #6.

## Layer of enforcement

(no property-specific rule yet — apply CROSS_CHECK_RULES #1)

## Enforcement entities

Distinguish "who provides the verdict" from "who operationally invokes the check". The enforcement entity is whichever party's decision is dispositive — i.e. whose verdict determines whether the transaction is allowed, blocked, or tainted. If a protocol team runs an executor that calls an external analytics vendor (Chainalysis, TRM, Elliptic, Global Ledger) and acts on the returned score, the entity is "Third party", not "Admin" — the vendor classifies addresses; the team's role is operational. "Admin" applies only when the protocol team itself decides who is blocked: curates the list, sets the policy thresholds, chooses who to allow. Apply CROSS_CHECK_RULES #1, #5.

## Point of enforcement

(no property-specific rule yet — apply CROSS_CHECK_RULES #1)

## Selective disclosure: viewing entity

(no property-specific rule yet — apply CROSS_CHECK_RULES #3, #4)

## Selective disclosure: viewing control

(no property-specific rule yet — apply CROSS_CHECK_RULES #3)
