export const CATEGORY_EXPLAINERS: Record<string, string | undefined> = {
  "Stealth addresses":
    "A scheme where each payment goes to a fresh one-time address derived from the recipient's public keys, so outside observers can't link payments to a single account. Recipient can claim the funds using his private keys.",
  zkWormholes:
    "Use zero-knowledge proofs to let funds 'teleport' between unrelated addresses without revealing a link between them. Recipient can mint funds to any address by privately providing a proof that the receiver address is a burn address.",
  Mixer:
    "A contract that pools deposits from many users and lets each withdraw to a new address, breaking the on-chain link between source and destination.",
  "Homomorphic encryption (FHE - HE)":
    "Computes on encrypted data directly, so balances and transfer amounts stay encrypted while still being validated by the protocol.",
  "Edge blockchain":
    "A blockchain or L2 architecture where the globally replicated chain is minimized. Users, wallets, devices, clients, or local app nodes hold the data/state needed to validate their own assets or actions.",
  L2s: "Layer-2 rollups that add privacy features on top of Ethereum, inheriting its security while reducing cost.",
  "Garbled circuits":
    "A two-party MPC technique where a computation is turned into an encrypted circuit one party evaluates without learning the other's inputs.",
  TEEs: "Trusted Execution Environments (e.g. Intel SGX) run private logic inside hardware enclaves that outside software can't inspect.",
  "EVM Obfuscators":
    "Tools that obfuscate or re-encode EVM calls and state to hide the semantics of what a transaction is doing. Privacy is achieved by obscurity and not hard cryptographic guarantees.",
  Wallets:
    "Wallet-level privacy features — the wallet itself offers stealth flows, address rotation or shielded balances on top of existing protocols.",
  "Alternative L1":
    "Standalone Layer-1 chains designed from the ground up around private transactions, settling on their own consensus rather than Ethereum.",
  "Shielded pool":
    "A smart-contract pool where assets are deposited into an encrypted UTXO note-based set; transfers happen inside the pool and only deposits/withdrawals are visible.",
  Plasma:
    "A scaling design where most activity lives off-chain with only compact commitments and exits posted on-chain. Plasmas initially lacked validity proofs but newer designs are adding them.",
  Validium:
    "A rollup variant where data is kept off-chain under a separate data-availability layer, while validity proofs are posted on-chain.",
  "Cross-chain swap aggregator":
    "Routes value across L1s via centralized exchanges or similar off-chain hops to break on-chain linkability.",
  "Multi Party Computation (MPC)":
    "A committee of nodes jointly computes on secret-shared inputs; no single node sees the cleartext.",
  "VPN (Private Intents)":
    "An intent layer where users broadcast desired outcomes privately and a solver network executes without revealing the originator.",
  "Zero Knowledge Proofs (ZKPs)":
    "Cryptographic proofs that verify a computation or statement without revealing the underlying data. Enables verification of private transactions while keeping amounts, participants, and assets hidden.",
  "Private Bridge":
    "A cross-chain bridge protocol that adds privacy to asset transfers between different blockchains, hiding the source, destination, and amount of bridged assets.",
  "Privacy Stack/Layer/Middleware":
    "A software stack or middleware layer that adds privacy features on top of existing blockchain infrastructure without requiring protocol-level changes.",
  coSNARKs:
    "Collaborative SNARK schemes where multiple parties jointly compute zero-knowledge proofs, combining privacy with distributed and decentralized proof generation.",
  "Private L3":
    "A Layer-3 solution built on top of a Layer-2 with privacy features, adding an additional scaling and privacy layer.",
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
