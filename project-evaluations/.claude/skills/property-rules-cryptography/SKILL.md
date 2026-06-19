---
name: property-rules-cryptography
description: Per-property guidance for the Cryptography property group. Invoke when evaluating, reviewing, or editing notes/values for Verifiability, Post-quantum secure, Number of secrets, or Client-side proving. Cross-cutting rules in scripts/research-prompts.ts still apply on top — particularly WRITING_RULES #13 about naming standard primitives (proof system, curve, signature, hash, key derivation).
---

# Cryptography property rules

Apply the rule for the property currently being evaluated. Cross-cutting rules in `scripts/research-prompts.ts` still apply.

## Verifiability

Multi-select. What enforces transaction validity — that no party can forge an invalid transfer, mint, or double-spend. Judge ONLY what stops a FORGED transition. Ordering, liveness, censorship, and data availability are NOT validity — a sequencer or operator that cannot forge because a validity proof already constrains it does not belong here, even if it can halt, reorder, or withhold data. Those live in Censorship resistance, Escape hatch, and External network dependence. Privacy crypto (FHE / garbled circuits encrypting values) does not count unless it carries a re-checkable proof of correct computation.

**Cryptographic** — validity rests on re-checkable cryptography: a ZK validity proof, ring signatures, stealth-address derivation plus signatures, or a proof-of-knowledge over inputs that a contract enforces. The operator or sequencer cannot forge. A protocol still counts as Cryptographic when a proof guards only part of the transition (e.g. input well-formedness), as long as that proof is re-checkable on-chain.

**Honest Majority (Consensus, Threshold committee)** — validity rests on an honest threshold of a set you must trust, with no re-checkable proof. One primitive across both ends: a permissionless validator / own-consensus set (its own L1, or an L2 with its own decentralised sequencer) and a small permissioned MPC / FHE / threshold committee (coti, merces, redact, fluton). Do NOT tag a protocol that merely rides a host chain. How decentralised the set is belongs to the decentralisation axes, not here.

**Trusted hardware** — a TEE / SGX enclave performs a validity job whose correctness you trust to hardware attestation: executing the transfer, or verifying the proofs and signed messages a contract accepts (mirage, redact). A TEE used only to decrypt or protect data in transit is confidentiality, not validity — do NOT tag it (fluton).

**Trusted operator** — validity rests on a single party that can produce or withhold a wrong result with no re-checkable proof (houdiniswap). A single permissioned sequencer that only orders behind a validity proof is NOT tagged — that is liveness, captured elsewhere.

Combine as needed: a shielded L1 is [Cryptographic, Honest Majority (Consensus, Threshold committee)] (zcash, monero); an MPC protocol with an on-chain validity proof is [Cryptographic, Honest Majority (Consensus, Threshold committee)] (merces); an MPC chain whose confidential compute has no correctness proof is [Honest Majority (Consensus, Threshold committee)] (coti); an FHE app whose threshold network decrypts, with an input proof verified in a TEE, is [Cryptographic, Honest Majority (Consensus, Threshold committee), Trusted hardware] (redact); an FHE app with only the threshold network is [Honest Majority (Consensus, Threshold committee)] (fluton); a single-sequencer validity-proof rollup or validium is [Cryptographic] (miden, scroll-cloak, zksync-prividium), because the operator only orders; an off-chain routing aggregator with no proof is [Trusted operator] (houdiniswap); SGX execution plus an on-chain Merkle proof and bonded operators is [Cryptographic, Trusted hardware, Trusted operator] (mirage).

Upgradeable verifier contracts and permissioned admin gates are NOT a reason to downgrade — those are captured by Upgradeability and Censorship resistance. Notes should mention if the verifier is swappable.

## Post-quantum secure

(no property-specific rule yet — apply cross-cutting rules)

## Number of secrets

Count only independently stored secrets. If all keys (spending, viewing, encryption) are deterministically derived from one wallet signature or mnemonic, the value is 1. The minimum is 1 whenever the user must sign anything to use the protocol — even when the protocol derives no keys of its own and the user just signs with their pre-existing Ethereum wallet, the wallet key is the one secret in use. Never emit 0. Notes MUST list every key, how each is derived, and the cryptographic primitives used.

## Client-side proving

Reflect only the live mechanism (CROSS_CHECK_RULES #6). If the protocol currently relies on a centralised prover and a decentralised or client-side prover is on the roadmap, the value reflects the centralised state — describe the planned change in notes only. Do not pre-rate based on intent.

Server-side proving makes the answer No when the proving service sees the user's private inputs (the operator can learn linkable data) — this holds even if a self-hosted option exists, when self-hosting is an advanced/edge-case workaround rather than the path most privacy-conscious users would take; note the self-host option in notes. It is Yes when (a) running the prover yourself is a first-class, documented path most privacy-conscious users would use — an open-source prover routinely run client-side — or (b) the heavy work is outsourced to an untrusted prover that operates over blinded data and learns nothing, with the result still cryptographically verifiable (compute outsourcing, not a trust dependency). Encrypting a request or "signal" to a TEE's public key is an encryption step, not a proving step — if the only proof in the system is built server-side by an operator/enclave that sees the cleartext, the answer is No.

**Citation-value consistency.** When a cited span describes client-side proving as a delivered feature ("the user's device generates the ZK proof", "in-browser WASM prover", "client-side proving is the default") and the property's value is No, those two states are inconsistent — the value must be Yes (or the cite must be re-read against the live deployment). When the cited span describes client-side proving as a future / roadmap feature ("client-side proving is in development for stronger privacy", "moving ZK proof generation to the user's device" framed as upcoming), the value remains No until that path is delivered, and the cite supports rather than contradicts the verdict.

Use "Not applicable" (N/A) when the protocol uses no proof system at all — for example, TEE-only execution (Mirage's SGX-backed Nomad network), plain MPC threshold-decryption protocols, or off-chain routing aggregators that ride entirely on existing chain signatures. "No" is reserved for protocols that DO use proofs but generate them server-side; "Not applicable" is for protocols where the question of client-vs-server proving has no answer because there is no proof.

Partial-server-side case. Some protocols generate the core transfer proof client-side but offload a specific auxiliary proof — typically ZK storage / MPT proofs over chain state, or a heavy recursion step — to a hosted prover. The value still depends on whether the offloaded prover sees user-private witnesses: if the server proof's witness is public chain state, mark "Yes" and describe the offload in notes; if the server proof includes the user's private inputs (note ciphertexts, owned-output set, address linkage), mark "No". When the deployed split between client- and server-side proving is not pinned down for the protocol's current release, keep the value that matches the documented client-side core path and set `needsResearchReview` to a reason string naming the unconfirmed split.
