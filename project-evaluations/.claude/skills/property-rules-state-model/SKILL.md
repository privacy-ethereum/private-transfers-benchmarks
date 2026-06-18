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

Options: `Scanning`, `No Scanning`. Binary, and device-centric: must the user's own device scan the chain (trial-decrypting notes / outputs) to discover its funds?

- `Scanning` — the device scans, whether full-chain or reduced with view-tags / filters (Monero, Zcash, Railgun, Aztec, stealth-address wallets watching for incoming payments).
- `No Scanning` — the device does not scan. different cases qualify: secret-note recall (Tornado, Privacy Pools), direct account / balance lookup (encrypted-ERC20 and account-based ledgers — redact, tongo, scroll-cloak), and discovery delegated to an off-chain indexer / service that scans on the device's behalf (anoma-pay, bermudabay).

Delegated / indexer-assisted discovery is `No Scanning` because the property asks what the _device_ does — but note it, since delegation adds a trust dependency (the indexer may see the user's discovery / viewing key) that the binary label does not capture. Do NOT use the old `Always scanning` / `Partial scanning` / `No scanning` wording.

## Private State Scalability

Options: `Per Transaction`, `Per Account`, `Stateless`. The property is scoped to **on-chain** protocol-specific private state — what accumulates in chain-visible storage / event history. Off-chain or client-side growth does NOT set the value; mention it in the notes instead (see Stateless below).

Decide with this test:

- **Per Transaction** — an on-chain object grows monotonically with the number of transactions and is never pruned: an append-only commitment / note / nullifier tree (Zcash-style pools, Railgun, Privacy Pools, Tornado), an ever-growing on-chain hash chain (zerc20), a per-payment announcement log (Umbra-style stealth addresses), or a fresh escrow / handler / one-shot contract deployed per transfer (Mirage, Fluidkey). Per-transaction contract deployment counts even when each contract is inert post-settlement — the permanent bytecode + storage footprint still accumulates per transaction. A bounded root-history ring buffer does not bound the underlying tree.

- **Per Account** — on-chain state is keyed per account and updated in place, so it grows with the number of distinct accounts, NOT with transaction count: an encrypted-balance-per-address mapping whose entries live on-chain (encrypted-ERC20 / FHE-balance designs — redact, tongo). Adding a holder adds one entry; transfers between existing holders rewrite entries without enlarging the set. An account-based EVM ledger qualifies here only when its state is posted on-chain — a validium variant that keeps accounts in an off-chain sequencer is `Stateless` (see below).

- **Stateless** — no on-chain object (live, dead, or derived) accumulates with usage. Use this only when the on-chain footprint is genuinely flat. When the protocol pushes unbounded state off-chain or onto clients (Plasma-style data availability — intmax; validiums that post only data commitments to a host chain while keeping accounts and transactions in an off-chain sequencer — scroll-cloak; off-chain coprocessor state), the value is still `Stateless` because on-chain state does not grow, but the notes MUST say where the growth actually lives (off-chain DA, client-held UTXO history, coprocessor) so the picture is not misleading.

Disambiguation: the _Private state model_ value ("Account-based" vs "UTXO-based") does NOT determine this property. An account-based token layer can still be `Per Transaction` when the protocol adds an append-only privacy structure on top (zerc20's hash chain, worm's nullifier set). Categorise by what actually accumulates on-chain, not by the conceptual model.
