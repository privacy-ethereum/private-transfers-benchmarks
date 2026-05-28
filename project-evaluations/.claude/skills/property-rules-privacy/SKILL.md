---
name: property-rules-privacy
description: Per-property guidance for the Privacy property group. Invoke when evaluating, reviewing, or editing notes/values for any of Anonymity, Confidentiality, Asset privacy, or Plausible deniability. Loads only the privacy-group rules so the active context stays focused on the property at hand. Cross-cutting rules in scripts/research-prompts.ts (WRITING, CROSS_CHECK, VALUE_FORMAT, SOURCE_SELECTION, REVIEW_ONLY) still apply on top.
---

# Privacy property rules

Apply the rule for the property currently being evaluated. Cross-cutting rules in `scripts/research-prompts.ts` still apply.

## Anonymity

Pick the strongest applicable enum. "Yes" = sender and receiver are both private. "Only sender" / "Only receiver" = exactly one side is hidden. "Unlinkability" = transfers are observable but identities cannot be linked across transactions (e.g. CoinJoin-style mixers without persistent identity). "No" = both sides are public. Never select "Unlinkability" when full anonymity holds — "Unlinkability" is the weaker option for protocols where activity remains linkable in some sense and only identity-linking is broken.

## Confidentiality

For protocols that use standard ERC-20 (or any unmodified public-ledger token) as the user-facing balance, the value is No. The token contract leaks per-address balances and transfer amounts regardless of how private movement between addresses is.

**Shielded-pool protocols default to Yes.** When the protocol category includes "Shielded Pool" (or the docs describe note commitments + nullifiers + ZK-proven in-pool transfers), the default Confidentiality is Yes — internal pool state hides balances and amounts between accounts. The fact that deposit/withdraw entry amounts are publicly visible at the pool boundary does NOT make Confidentiality No; that's a property of the deposit/withdraw step, not of the in-pool transfer surface. To override the Yes default, cite explicit evidence that in-pool transfers leak amounts (e.g. a public-amount transfer mode, an unblinded notes structure).

## Asset privacy

For single-asset protocols (e.g. a chain with only one native currency, or a single wrapped token per asset), the value is No.

A shielded pool that holds assets as encrypted notes normally rates Yes: when the amount and the asset behind a note are hidden in shielded state so that internal transfers reveal them only to the counterparties, asset privacy holds. The deposit and withdrawal boundary exposing which token is wrapped (per-token forwarders, or per-asset pool addresses) is inherent to entering or leaving any shielded pool and does not by itself force No — it bears on boundary anonymity, not on the asset privacy of shielded balances. Reserve No for single-asset protocols and for pools that keep funds in a transparent per-token mapping with no note-level encryption of the asset. Credit explicit evidence that notes encrypt the asset or amount (a circuit treating the token as a hidden input, docs stating values are encrypted in shielded state, an SDK referencing a singular multi-asset pool); but do not infer multi-asset shielding from mere architectural similarity to RAILGUN.

## Plausible deniability

This property asks whether the user's full normal-usage path from native asset to private transfer is indistinguishable from ordinary on-chain activity. If any step in that path is a call to a protocol-specific contract, the answer is No, even when a downstream leg looks like a plain transfer — the protocol-specific call pre-establishes that the user is using the privacy protocol.

- Native-asset proof-of-burn protocols (e.g. WORM) are Yes: users burn native ETH directly to a stealth address with no protocol contract touched at entry.
- Wrapped-asset proof-of-burn protocols (e.g. zERC20) are No: users must first wrap into the protocol's ERC-20 via a protocol contract (e.g. a LiquidityManager) before they can transfer privately. The wrap is observable.
- For privacy-by-default protocols (e.g. Monero) the answer is No — the entire chain is a known privacy system.
- For opt-in shielded-pool protocols (e.g. Railgun, Tornado Cash) the answer is No because the deposit itself calls a known privacy contract.
- When the answer is Yes, notes MUST state explicitly that deniability covers deposit/entry only and does not extend to withdraw/mint, since the withdraw step is a visible interaction with the verifier.
