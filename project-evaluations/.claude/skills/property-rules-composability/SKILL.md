---
name: property-rules-composability
description: Per-property guidance for the Composability property group. Invoke when evaluating, reviewing, or editing notes/values for Access to DeFi or Programmability / Generality. Cross-cutting rules in scripts/research-prompts.ts still apply on top.
---

# Composability property rules

Apply the rule for the property currently being evaluated. Cross-cutting rules in `scripts/research-prompts.ts` still apply.

## Access to DeFi

What this property measures: whether the protocol's own asset — its shielded balances, its wrapper tokens, its notes — can be used in DeFi. The recipient of a payout using the withdrawn plaintext funds in DeFi does NOT count — that is the host chain's surface, available to any address, not something the protocol provides.

- If the protocol issues or wraps a token that is itself usable in DeFi like any other token — an ERC-20 wrapper accepted on any DEX, lending market, or bridge (zERC20, WORM, a shielded ERC-20) → "Unlimited access to DeFi applications" (use a narrower value if the protocol's own integration surface is curated).
- If the protocol provides a mechanism (relay-adapt-style adapter, shielded-swap primitive) that lets the shielded/private asset interact with a subset of external DeFi → "Access to external, but limited choice of DeFi protocols" (or "Access to internal DeFi ecosystem" if it is a self-contained ecosystem with no external composition; "Composable interface, but requires DeFi protocol changes" if there is only an integration hook external protocols haven't adopted).
- If the protocol is payments-only — it relocates existing tokens between addresses with no protocol token, no shielded asset, and no composability hook (Tornado Cash, Privacy Pools, CEX-hop routers, escrow-based transfer layers like Houdini or Mirage) → "No access to DeFi".

Verify by inspecting the contract for swap/router calls or external-protocol callbacks; if external composition cannot be confirmed in the live contracts, set `needsResearchReview: true`.

## Programmability / Generality

(no property-specific rule yet — apply cross-cutting rules)
