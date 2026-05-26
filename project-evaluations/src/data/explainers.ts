export const CATEGORY_EXPLAINERS: Record<string, string | undefined> = {
  "Mixer":
    "A contract that pools deposits from many users and lets each withdraw to a new address, breaking the on-chain link between source and destination.",
  "Shielded Pool":
    "A smart-contract pool where assets are deposited into an encrypted UTXO note-based set. Transfers happen inside the pool and only deposits/withdrawals are visible.",
  "Stealth Addresses":
    "A scheme where each payment goes to a fresh one-time address derived from the recipient's public keys, so outside observers can't link payments to a single account. Recipient can claim the funds using their private keys.",
  "Encrypted Tokens":
    "Token standards that hold balances and transfer amounts as on-chain ciphertexts, so values stay hidden while accounts and transfers remain visible.",
  "Zero Knowledge Proofs (ZKPs)":
    "Cryptographic proofs that verify a computation or statement without revealing the underlying data. Enables verification of private transactions while keeping amounts, participants, and assets hidden.",
  "Fully Homomorphic encryption (FHE)":
    "Computes arbitrary functions directly on encrypted data, so balances, amounts and richer logic stay encrypted end-to-end while still being validated by the protocol.",
  "Homomorphic Encryption (HE)":
    "Computes a limited set of operations (typically additions) on encrypted data — enough to keep balances and transfer amounts encrypted, commonly via the ElGamal encrytption algorithm.",
  "Multi Party Computation (MPC)":
    "A committee of nodes jointly computes on secret-shared inputs. No single node sees the cleartext.",
  "Trusted Execution Environments (TEEs)":
    "Trusted Execution Environments (e.g. Intel SGX) run private logic inside hardware enclaves that outside software can't inspect.",
  "Bytecode Obfuscator":
    "Tools that obfuscate or re-encode EVM calls and state to hide the semantics of what a transaction is doing. Privacy is achieved by obscurity and not hard cryptographic guarantees.",
  "Garbled Circuits":
    "A two-party MPC technique where a computation is turned into an encrypted circuit one party evaluates without learning the other's inputs.",
  "CoSNARKs":
    "Collaborative SNARK schemes where multiple parties jointly compute zero-knowledge proofs, combining privacy with distributed and decentralized proof generation.",
  "Virtual Private EVM Network":
    "A privacy layer where users broadcast transactions to a virtual network. It sits between a wallet and a chain via a custom RPC proxy. The proxy converts a user's regular transaction details into shielded notes and produces zero-knowledge proofs executing deposits, transfers and withdrawals.",
  "Cross-Chain Swap Aggregator":
    "Routes value across L1s via centralized exchanges or similar off-chain hops to break on-chain linkability.",
  "Private Bridge":
    "A cross-chain bridge protocol that adds privacy to asset transfers between different blockchains, hiding the source, destination, and amount of bridged assets.",
  "Zero-Knowledge Wormholes":
    "Use zero-knowledge proofs to move funds between addresses without revealing a link between them. A recipient can mint funds to any address by privately proving they sent funds to an unclaimable address.",
  "Post-Quantum":
    "Cryptography believed to resist attacks from quantum computers, so privacy and integrity guarantees hold even against a future quantum adversary.",
  "Private L1":
    "A standalone Layer-1 blockchain designed from the ground up around private transactions, settling on its own consensus rather than on Ethereum.",
  "Private L2":
    "A Layer-2 rollup with dedicated privacy features that settles on top of an L1, inheriting the security and reducing costs.",
  "Private L3":
    "A Layer-3 built on top of a Layer-2 with privacy features, allowing for additional customisation and features.",
  "Private Plasma":
    "A scaling design where most activity lives off-chain with only compact commitments and exits are posted on-chain, combined with privacy over that off-chain state.",
  "Private Validium":
    "A rollup variant where transaction data is kept off-chain under a separate data-availability layer while validity proofs are posted on-chain, keeping that data private.",
  "Decentralised Network":
    "A network of independent operators collectively providing a service, with no single party able to control the network.",
  "Privacy Stack/Layer/Middleware":
    "A software stack or middleware layer that adds privacy features on top of existing blockchain infrastructure.",
  "Solana project": "A privacy protocol built as an application on Solana, using Solana's accounts and programs.",
  "Other L1 project": "A privacy protocol built as an application on an existing general-purpose Layer-1.",
};

export type CategoryType = "technology" | "architecture" | "ecosystem";

/** Splits each category into a technology, architecture, or ecosystem. */
export const CATEGORY_TYPES: Record<string, CategoryType> = {
  // Technologies
  "Zero Knowledge Proofs (ZKPs)": "technology",
  "Fully Homomorphic encryption (FHE)": "technology",
  "Homomorphic Encryption (HE)": "technology",
  "Multi Party Computation (MPC)": "technology",
  "Trusted Execution Environments (TEEs)": "technology",
  "Garbled Circuits": "technology",
  "CoSNARKs": "technology",

  // Architectures
  "Mixer": "architecture",
  "Shielded Pool": "architecture",
  "Stealth Addresses": "architecture",
  "Encrypted Tokens": "architecture",
  "Bytecode Obfuscator": "architecture",
  "Virtual Private EVM Network": "architecture",
  "Cross-Chain Swap Aggregator": "architecture",
  "Private Bridge": "architecture",
  "Zero-Knowledge Wormholes": "architecture",
  "Private L1": "architecture",
  "Private L2": "architecture",
  "Private L3": "architecture",
  "Private Plasma": "architecture",
  "Private Validium": "architecture",
  "Decentralised Network": "architecture",
  "Privacy Stack/Layer/Middleware": "architecture",

  // Ecosystems
  "Solana project": "ecosystem",
  "Other L1 project": "ecosystem",
};

export const GROUP_EXPLAINERS: Record<string, string | undefined> = {
  "Privacy":
    "What is actually hidden: amounts, identities, assets, and whether using the protocol is itself observable.",
  "Cost and Performance": "On-chain gas cost of each step and how long transactions take to finalize.",
  "UX": "How much the user has to manage: secrets to back up, time to deposit or withdraw.",
  "Decentralization & Security":
    "Trust assumptions — who can censor, upgrade, or inspect state. Whether proofs are generated client-side. Maturity of the deployment.",
  "Compliance": "Where and how compliance is enforced, who enforces it, and what selective-disclosure options exist.",
  "Verifiable": "Whether the system's correctness is guaranteed cryptographically and whether the code is open source.",
  "State": "How private state is stored, scaled, and scanned by clients.",
  "Composability":
    "How shielded assets interact with the wider DeFi ecosystem and how expressive the private logic can be.",
};
