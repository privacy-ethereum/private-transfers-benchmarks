---
name: property-rules-cryptography
description: Per-property guidance for the Cryptography property group. Invoke when evaluating, reviewing, or editing notes/values for Cryptographic verifiability, Post-quantum secure, Number of secrets, or Client-side proving. Cross-cutting rules in scripts/research-prompts.ts still apply on top — particularly WRITING_RULES #13 about naming standard primitives (proof system, curve, signature, hash, key derivation).
---

# Cryptography property rules

Apply the rule for the property currently being evaluated. Cross-cutting rules in `scripts/research-prompts.ts` still apply.

## Cryptographic verifiability

Yes when transaction correctness is enforced by cryptographic proof verification (zk-SNARKs, ring signatures, signature schemes) that an external observer can re-check against the math given the published verifier. Application-layer protocols (ERC-20s, contract suites deployed on an existing chain) are "Yes", not "Yes, with L1 consensus" — block ordering and inclusion are the host chain's job and are captured under Time-to-finality, not here. "Yes, with L1 consensus" is only for protocols that are themselves an L1/rollup whose consensus is part of the protocol — individual transaction correctness is cryptographic but ordering/inclusion is consensus-based (PoW/PoS majority). No when correctness rests on an economic mechanism (stake-slashing not tied to a math proof), a social mechanism (multisig vote, governance signoff), a hardware-trust mechanism (TEE/SGX attestation, where trust roots in a hardware vendor signing CA rather than pure math), or an FHE coprocessor whose homomorphic-computation results carry no re-checkable correctness proof (input proofs-of-knowledge alone do not count — the computation itself rests on the coprocessor and its threshold/decryption network being honest). Upgradeable verifier contracts and permissioned admin gates are NOT a reason to mark No here — those are separately captured by Upgradeability and Censorship resistance. Notes should still mention if the verifier is swappable so readers see the full picture.

## Post-quantum secure

(no property-specific rule yet — apply cross-cutting rules)

## Number of secrets

Count only independently stored secrets. If all keys (spending, viewing, encryption) are deterministically derived from one wallet signature or mnemonic, the value is 1. The minimum is 1 whenever the user must sign anything to use the protocol — even when the protocol derives no keys of its own and the user just signs with their pre-existing Ethereum wallet, the wallet key is the one secret in use. Never emit 0. Notes MUST list every key, how each is derived, and the cryptographic primitives used.

## Client-side proving

Reflect only the live mechanism (CROSS_CHECK_RULES #6). If the protocol currently relies on a centralised prover and a decentralised or client-side prover is on the roadmap, the value reflects the centralised state — describe the planned change in notes only. Do not pre-rate based on intent.

Server-side proving makes the answer No when the proving service sees the user's private inputs (the operator can learn linkable data) — this holds even if a self-hosted option exists, when self-hosting is an advanced/edge-case workaround rather than the path most privacy-conscious users would take; note the self-host option in notes. It is Yes when (a) running the prover yourself is a first-class, documented path most privacy-conscious users would use — an open-source prover routinely run client-side — or (b) the heavy work is outsourced to an untrusted prover that operates over blinded data and learns nothing, with the result still cryptographically verifiable (compute outsourcing, not a trust dependency). Encrypting a request or "signal" to a TEE's public key is an encryption step, not a proving step — if the only proof in the system is built server-side by an operator/enclave that sees the cleartext, the answer is No.

Use "Not applicable" (N/A) when the protocol uses no proof system at all — for example, TEE-only execution (Mirage's SGX-backed Nomad network), plain MPC threshold-decryption protocols, or off-chain routing aggregators that ride entirely on existing chain signatures. "No" is reserved for protocols that DO use proofs but generate them server-side; "Not applicable" is for protocols where the question of client-vs-server proving has no answer because there is no proof.

Partial-server-side case. Some protocols generate the core transfer proof client-side but offload a specific auxiliary proof — typically ZK storage / MPT proofs over chain state, or a heavy recursion step — to a hosted prover. The value still depends on whether the offloaded prover sees user-private witnesses: if the server proof's witness is public chain state, mark "Yes" and describe the offload in notes; if the server proof includes the user's private inputs (note ciphertexts, owned-output set, address linkage), mark "No". When the deployed split between client- and server-side proving is not pinned down for the protocol's current release, keep the value that matches the documented client-side core path and set `needsResearchReview` to a reason string naming the unconfirmed split.
