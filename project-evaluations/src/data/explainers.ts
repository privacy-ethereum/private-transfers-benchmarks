export const CATEGORY_EXPLAINERS: Record<string, string | undefined> = {
  "Stealth addresses":
    "A scheme where each payment goes to a fresh one-time address derived from the recipient's public keys, so outside observers can't link payments to a single account.",
  zkWormholes:
    "Use zero-knowledge proofs to let funds 'teleport' between unrelated addresses or chains without revealing a link between them.",
  Mixer:
    "A contract that pools deposits from many users and lets each withdraw to a new address, breaking the on-chain link between source and destination.",
  "Homomorphic encryption (FHE - HE)":
    "Computes on encrypted data directly, so balances and transfer amounts stay encrypted while still being validated by the protocol.",
  "Edge blockchain":
    "Privacy is handled on a separate chain at the edge of the network, which then settles or anchors back to Ethereum.",
  L2s: "Layer-2 rollups that add privacy features on top of Ethereum, inheriting its security while reducing cost.",
  "Garbled circuits":
    "A two-party MPC technique where a computation is turned into an encrypted circuit one party evaluates without learning the other's inputs.",
  TEEs: "Trusted Execution Environments (e.g. Intel SGX) run private logic inside hardware enclaves that outside software can't inspect.",
  "EVM Obfuscators":
    "Tools that obfuscate or re-encode EVM calls and state to hide the semantics of what a transaction is doing.",
  Wallets:
    "Wallet-level privacy features — the wallet itself offers stealth flows, address rotation or shielded balances on top of existing protocols.",
  "Alternative L1":
    "Standalone Layer-1 chains designed from the ground up around private transactions, settling on their own consensus rather than Ethereum.",
  "Shielded pool":
    "A smart-contract pool where assets are deposited into an encrypted UTXO set; transfers happen inside the pool and only deposits/withdrawals are visible.",
  Plasma:
    "A scaling design where most activity lives off-chain with only compact commitments and exits posted on-chain.",
  Validium:
    "A rollup variant where data is kept off-chain under a separate data-availability committee, while validity proofs are posted on-chain.",
  "Cross-L1 CEX aggregator and mixer":
    "Routes value across L1s via centralized exchanges or similar off-chain hops to break on-chain linkability.",
  "Multi Party Computation (MPC)":
    "A committee of nodes jointly computes on secret-shared inputs; no single node sees the cleartext.",
  "VPN (Private Intents)":
    "An intent layer where users broadcast desired outcomes privately and a solver network executes without revealing the originator.",
};

export const GROUP_EXPLAINERS: Record<string, string | undefined> = {
  Privacy: "What is actually hidden: amounts, identities, assets, and whether using the protocol is itself observable.",
  "Cost and Performance": "On-chain gas cost of each step and how long transactions take to finalize.",
  UX: "How much the user has to manage: secrets to back up, time to deposit or withdraw.",
  "Decentralization & Security":
    "Trust assumptions — who can censor, upgrade, or inspect state; whether proofs are generated client-side; maturity of the deployment.",
  Compliance: "Where and how compliance is enforced, who enforces it, and what selective-disclosure options exist.",
  Verifiable: "Whether the system's correctness is guaranteed cryptographically and whether the code is open source.",
  State: "How private state is stored, scaled, and scanned by clients.",
  Composability:
    "How shielded assets interact with the wider DeFi ecosystem and how expressive the private logic can be.",
};
