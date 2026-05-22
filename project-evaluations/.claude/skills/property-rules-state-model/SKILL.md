---
name: property-rules-state-model
description: Per-property guidance for the State property group. Invoke when evaluating, reviewing, or editing notes/values for Private state model, Private Data Storage, Client-side indexing, or Private State Scalability. Cross-cutting rules in scripts/research-prompts.ts still apply on top.
---

# State property rules

Apply the rule for the property currently being evaluated. Cross-cutting rules in `scripts/research-prompts.ts` still apply.

## Private state model

Note-commitment / nullifier constructions — a Merkle tree of commitments spent by publishing nullifiers (Zcash-style shielded pools, Railgun, Tornado-style pools, Privacy Pools) — are "UTXO-based state model". Encrypted-balance-per-account constructions — a per-address balance ciphertext updated in place (encrypted-ERC20 designs, FHE balance mappings) — are "Account-based state model". A service with no on-chain private state at all follows VALUE_FORMAT_RULES #3 (pick the closest value, then say in notes the property does not really apply).

Inferred-from-bundled-libraries caveat. A bundled-library set in a parent repo (e.g. a wrapper repo that vendors railgun + privacy-pools + a stealth-address module) is NOT sufficient evidence to substantiate the state model of the protocol's own deployed contracts — vendored libraries say what the team imported, not what the production contract instantiates. When the value is inferred from such a set rather than read from the deployed shielded-pool source, set `needsResearchReview` to a reason string naming the inference (e.g. `"state model inferred from bundled-library set; not confirmed against deployed contract source"`).

## Private Data Storage

Events emitted by the protocol's own contracts count as on-chain storage — the value is "Smart contracts" even when the events carry encrypted blobs, because the data is part of every full node's chain history. This includes the common pattern where commitments/nullifiers live in contract storage AND the encrypted note ciphertexts are emitted as event logs for recipients to trial-decrypt: that whole construction is on-chain → "Smart contracts". "Off-chain storage with on-chain commitment" applies only when the private payload itself lives off-chain (IPFS, indexer DB, operator server, peer-to-peer relay) with only a hash, root, or commitment posted on-chain — a gas-efficient on-chain hash chain over data still emitted in events is not this case. An off-chain mirror of on-chain state — a chain-state crawler that periodically snapshots contract storage via GitHub Actions, a public indexer DB rebuilt from event logs, a wallet's local cache of synced commitments — is NOT "Off-chain storage with on-chain commitment": that label is reserved for protocols where the off-chain side is the authoritative store of additional data committed to via a hash, not a derived replica of authoritative on-chain state. The authoritative-vs-mirror test: if the off-chain artefact disappears, does the protocol lose any data that isn't already on-chain? If no, it's a mirror, and the value stays "Smart contracts". Do not reach for "Off-chain storage with on-chain commitment" merely because nothing else seems to fit an off-chain-only service: that value requires a real on-chain commitment over off-chain data. "Smart contracts" is the right pick whenever there is protocol-managed contract storage or event-log data. "Protocol state" applies when private state is part of the chain's protocol-level state machine (e.g. UTXO commitments built into the consensus state).

For services with no protocol contracts at all — off-chain routing aggregators, custodial-style services, any design whose on-chain footprint is just ordinary transfers with no privacy commitments — use `["N/A"]` alone. The property does not apply when there is no private transaction data to store. Do NOT combine N/A with another value, and do NOT force-fit one of the other options when no on-chain privacy state exists. This supersedes the older VALUE_FORMAT_RULES #3 "pick the closest enum value" guidance now that N/A is an explicit option.

## Client-side indexing

(no property-specific rule yet — apply cross-cutting rules)

## Private State Scalability

A component that grows monotonically with usage and is never pruned makes the value the growing variant ("Infinity grow"): an append-only commitment tree, an ever-growing nullifier set, or an off-chain coprocessor / data-availability layer whose encrypted state accumulates with every operation — the last counts even when the protocol's own on-chain state is just an in-place-updated account-balance mapping. Pick the stateless or bounded variant only when no component, on-chain or operator-side, grows without bound in the number of transactions. A bounded root-history ring buffer does not bound the underlying tree.

Per-transaction contract deployment is also state growth. Designs that deploy a fresh escrow / handler / one-shot contract per transfer (Mirage-style) leave a permanent on-chain bytecode + contract-storage footprint after each transfer, even when each contract is inert post-settlement. That accumulation across many transfers is "Infinity grow" — do NOT mark such designs "Stateless" on the grounds that no protocol-managed state machine grows. The growth is in dead per-transfer contracts rather than in an active state machine, but it is still unbounded on-chain growth and should be characterised as such. "Stateless" requires that no on-chain object (live, dead, or derived) accumulates with transaction count.
