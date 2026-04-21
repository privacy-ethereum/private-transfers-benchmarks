import { type PropertyContent } from "../types";

export const CATEGORIES = [
  "Stealth addresses",
  "zkWormholes",
  "Mixer",
  "Homomorphic encryption (FHE - HE)",
  "Edge blockchain",
  "L2s",
  "Garbled circuits",
  "TEEs",
  "EVM Obfuscators",
  "Wallets",
  "Alternative L1",
  "Shielded pool",
  "Plasma",
  "Validium",
  "Cross-L1 CEX aggregator and mixer",
  "Multi Party Computation (MPC)",
  "VPN (Private Intents)",
] as const;

/** Group definitions ordered for display */
export const PROPERTY_GROUPS = [
  "Privacy",
  "Cost and Performance",
  "UX",
  "Decentralization & Security",
  "Compliance",
  "Verifiable",
  "State",
  "Composability",
] as const;

export const PROPERTY_DEFINITIONS: PropertyContent[] = [
  // ── Privacy ──────────────────────────────────────────────────────────────
  {
    name: "Anonymity set size",
    group: "Privacy",
    description: "Number of entities participating in the protocol",
    metric: "Number of participants",
    inputType: "number",
  },
  {
    name: "Confidentiality",
    group: "Privacy",
    description: "Balances and amounts are private",
    metric: "Yes / Only balances / Only transfer amounts / No",
    inputType: "select",
    options: ["Yes", "Only balances", "Only transfer amounts", "No"],
  },
  {
    name: "Anonymity",
    group: "Privacy",
    description: "Sender and receiver are private",
    metric: "Yes / Only sender / Only receiver / No / Unlinkability",
    inputType: "select",
    options: ["Yes", "Only sender", "Only receiver", "No", "Unlinkability"],
  },
  {
    name: "Asset privacy",
    group: "Privacy",
    description: "Whether the specific asset being transferred is hidden from observers.",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },
  {
    name: "Plausible deniability",
    group: "Privacy",
    description:
      "It is not possible to detect if you are interacting with the privacy protocol. Transfers are indistinguishable from public transfers",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },

  // ── Cost and Performance ─────────────────────────────────────────────────
  {
    name: "On-chain gas cost: deposit",
    group: "Cost and Performance",
    description: "The gas cost of submitting a deposit transaction on-chain",
    metric: "Cost in gas (native gas value)",
    inputType: "number",
  },
  {
    name: "On-chain gas cost: transfer",
    group: "Cost and Performance",
    description: "The gas cost of submitting a transfer transaction on-chain",
    metric: "Cost in gas (native gas value)",
    inputType: "number",
  },
  {
    name: "On-chain gas cost: withdraw",
    group: "Cost and Performance",
    description: "The gas cost of submitting a withdraw transaction on-chain",
    metric: "Cost in gas (native gas value)",
    inputType: "number",
  },
  {
    name: "Time-to-finality",
    group: "Cost and Performance",
    description: "The time it takes for a transaction to be considered irreversible (in seconds).",
    metric: "Seconds or N/A",
    inputType: "text",
  },

  // ── UX ───────────────────────────────────────────────────────────────────
  {
    name: "Number of secrets",
    group: "UX",
    description: "How many new secrets must the user store to use the protocol.",
    metric: "Number of secrets",
    inputType: "number",
  },
  {
    name: "Deposit time",
    group: "UX",
    description: "Duration required before you can deposit into the protocol (in seconds).",
    metric: "Seconds or N/A",
    inputType: "text",
  },
  {
    name: "Withdraw time",
    group: "UX",
    description: "Duration required before you can withdraw funds from the protocol (in seconds).",
    metric: "Seconds or N/A",
    inputType: "text",
  },

  // ── Decentralization & Security ──────────────────────────────────────────
  {
    name: "Censorship resistance",
    group: "Decentralization & Security",
    description:
      "Whether any entity can prevent valid transactions from being included in the chain. Considers mining/validator censorship, protocol-level restrictions, and network-level blocking.",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },
  {
    name: "External network dependence",
    group: "Decentralization & Security",
    description: "Whether the protocol rely on an external network with additional crypto-economic assumptions",
    metric: "Yes permissioned / Yes permissionless / No",
    inputType: "select",
    options: ["Yes, permissioned", "Yes, permissionless", "No"],
  },
  {
    name: "Escape hatch",
    group: "Decentralization & Security",
    description:
      "Whether users can withdraw shielded funds relying only on the underlying blockchain's consensus and cryptography.",
    metric: "No / Can exit in a time period / Instantly / N/A",
    inputType: "select",
    options: ["No", "Can exit in a time period", "Instantly", "N/A"],
  },
  {
    name: "Upgradeability",
    group: "Decentralization & Security",
    description: "How upgrades to the system are performed.",
    metric: "Single admin / Multi-sig / DAO / Network upgrade (hard/soft fork) / Immutable",
    inputType: "select",
    options: ["Single admin", "Multi-sig", "DAO", "Network upgrade (hard/soft fork)", "Immutable"],
  },
  {
    name: "Client-side proving",
    group: "Decentralization & Security",
    description: "Whether the protocol generates proofs on the client device or depends on an external service",
    metric: "Yes / No / Not applicable",
    inputType: "select",
    options: ["Yes", "No", "Not applicable"],
  },
  {
    name: "Third-party inspectability",
    group: "Decentralization & Security",
    description:
      "Whether a third party or parties can inspect the private info of the users. This can happen if the protocol uses an external prover to generate proofs, the protocol uses a validium to register transfers, etc.",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },
  {
    name: "Implementation maturity",
    group: "Decentralization & Security",
    description:
      "How developed and battle-tested the protocol is, measured by type of deployment, production readiness, and amount of time deployed on mainnet. Maturity weights follow a 1–5 scale.",
    metric:
      "1 : Prototype/devnet  2 : Public testnet  3 : Mainnet < 1 year  4 : Mainnet > 1 year  5 : Mainnet > 2 years",
    inputType: "select",
    options: [
      "1 : Prototype / devnet",
      "2 : Public testnet",
      "3 : Mainnet for less than 1 year",
      "4 : Mainnet for more than 1 year",
      "5 : Mainnet for more than 2 years",
    ],
  },
  {
    name: "Post-quantum secure",
    group: "Decentralization & Security",
    description: "Is the protocol secure against quantum threats",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },

  // ── Compliance ───────────────────────────────────────────────────────────
  {
    name: "Layer of enforcement",
    group: "Compliance",
    description:
      "Where is compliance enforced in the protocol? Is it enforced on the blockchain itself? The protocol/app being used, or the underlying asset?",
    metric: "Asset / App / Protocol/chain / None",
    inputType: "select",
    options: ["Asset", "App", "Protocol/chain", "None"],
  },
  {
    name: "Enforcement entities",
    group: "Compliance",
    description:
      "Which entities enforce compliance restrictions. DAO/Governance: the protocol's governance mechanism (token-based or otherwise) makes decisions on blocklists, policy changes, and responses to security breaches. Third party: specialized service providers or organizations handle compliance operations on behalf of the protocol (e.g. providing regulatory recommendations, legal and business guidance). Admin: designated administrators or core team members maintain operational control over compliance parameters and enforcement mechanisms. Asset issuer: the entity that issued the asset maintains a blocklist or controls transfers.",
    metric: "DAO/Governance / Third party / Admin / Asset issuer / None",
    inputType: "select",
    options: ["DAO/Governance", "Third party", "Admin", "Asset issuer", "None"],
  },
  {
    name: "Type of compliance",
    group: "Compliance",
    description:
      "What compliance mechanisms are available or enforced. Programmatic policies: programmable per-transaction rule sets, validated by an external API or oracle that returns a cryptographic attestation of compliance (Predicate-style). Data sources commonly include blockchain-analytics vendors (Chainalysis, TRM, Elliptic), ISACs, fraud-detection feeds, off-chain KYC platforms, and ZK-identity tools — these data inputs are subsumed under Programmatic policies, not separate categories. KYC/KYB: identity verification required to participate (passport / liveness / sanctions screening); ZK-identity is an emerging privacy-preserving variant of the same category. POI/ASP: inclusion/exclusion-based ZK proofs over a curated set — Proof of Innocence proves funds do NOT intersect a disallowed set; Association Set Provider proves funds DO belong to an allowed set. Same ZK primitive, opposite set semantics. Selective disclosure: users can voluntarily reveal transaction details via viewing keys. Other: compliance mechanism not covered above.",
    metric: "POI/ASP / Selective disclosure / KYC/KYB / Programmatic policies / Other / None",
    inputType: "multi-select",
    options: [
      "Proof of innocence (POI) / ASP",
      "Selective disclosure",
      "KYC/KYB",
      "Programmatic policies",
      "Other",
      "None",
    ],
  },
  {
    name: "Point of enforcement",
    group: "Compliance",
    description:
      "Where the compliance is enforced in the private transfer lifecycle. When depositing, transferring within the protocol, or withdrawing.",
    metric: "Deposit / Transfer / Withdrawal / None",
    inputType: "multi-select",
    options: ["Deposit", "Transfer", "Withdrawal", "None"],
  },
  {
    name: "Selective disclosure: viewing entity",
    group: "Compliance",
    description:
      "Who can access private transaction data and under what conditions. User (Self-View): users can query their own balance and transaction history. Voluntary third-party: users can delegate viewing rights to a trusted party (e.g. auditor, accountant) via a viewing key. Involuntary third-party: a designated party (e.g. admin, regulator, security council) can access a user's balance and transaction history without consent. Protocol-level: disclosure rules can be modified at the protocol level, for example through governance or security council decisions.",
    metric: "User / Voluntary third-party / Involuntary third-party / Protocol / None",
    inputType: "multi-select",
    options: ["User", "Voluntary third-party disclosure", "Involuntary third-party disclosure", "Protocol", "None"],
  },
  {
    name: "Selective disclosure: viewing control",
    group: "Compliance",
    description:
      "Whether viewing permissions are fixed or can be updated. Pre-defined: permissions are set in advance and cannot be altered later (e.g. in ZK commitment-based systems, a recipient's viewing key is embedded in the proof at transfer time). Programmable: users or network participants can grant, revoke, or update viewing permissions at any time with full backward compatibility (e.g. retroactively granting an auditor access to past transactions, or a security council initiating an investigation).",
    metric: "Pre-defined / Programmable / None",
    inputType: "select",
    options: ["Pre-defined", "Programmable", "None"],
  },

  // ── Verifiable ───────────────────────────────────────────────────────────
  {
    name: "Cryptographic verifiability",
    group: "Verifiable",
    description:
      "Whether transaction correctness is guaranteed by cryptographic proofs rather than social or majority-based mechanisms.",
    metric: "Yes / Yes, with L1 consensus / No",
    inputType: "select",
    options: ["Yes", "Yes, with L1 consensus", "No"],
  },
  {
    name: "Open source",
    group: "Verifiable",
    description:
      "The source code for the underlying protocol, any backend infrastructure, and any frontend applications is publicly available to inspect and has an OSI-approved open source license.",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },

  // ── State ────────────────────────────────────────────────────────────────
  {
    name: "Private State Scalability",
    group: "State",
    description: "How protocol-specific private data grows over time.",
    metric:
      "Infinity grow (nullifier/note trees grow forever) / Temporal grow (state pruned at epochs, stored offchain) / Stateless (state updated but does not grow)",
    inputType: "select",
    options: ["Infinity grow", "Temporal grow", "Stateless"],
  },
  {
    name: "Client-side indexing",
    group: "State",
    description: "Whether user devices must continuously scan the chain to track balances or accounts",
    metric: "Always scanning / Partial scanning / No scanning",
    inputType: "select",
    options: ["Always scanning", "Partial scanning", "No scanning"],
  },
  {
    name: "Private state model",
    group: "State",
    description: "What model does the protocol use for managing private state",
    metric: "UTXO-based / Account-based / Private shared state",
    inputType: "select",
    options: ["UTXO-based state model", "Account-based state model", "Private shared state model"],
  },
  {
    name: "Private Data Storage",
    group: "State",
    description: "Where private transaction data is stored",
    metric: "Protocol state / Off-chain with on-chain commitment / Smart contracts",
    inputType: "select",
    options: ["Protocol state", "Off-chain storage with on-chain commitment", "Smart contracts"],
  },

  // ── Composability ────────────────────────────────────────────────────────
  {
    name: "Access to DeFi",
    group: "Composability",
    description:
      "Whether the solution can be used directly with DeFi applications. Whether the solution provides a native DeFi ecosystem for shielded assets Or whether there is no access to DeFi",
    metric: "No access / Internal DeFi ecosystem / External limited / Unlimited",
    inputType: "select",
    options: [
      "No access to DeFi",
      "Composable interface, but requires DeFi protocol changes",
      "Access to internal DeFi ecosystem",
      "Access to external, but limited choice of DeFi protocols",
      "Unlimited access to DeFi applications",
    ],
  },
  {
    name: "Programmability / Generality",
    group: "Composability",
    description:
      "Range and expressiveness of private logic: from simple payment flows to rich private smart-contract ecosystems",
    metric: "Only payments / Partial programmability / Full programmability / TBD: to be delivered",
    inputType: "select",
    options: [
      "Only payments",
      "Transfers and DeFi operations",
      "Partial programmability",
      "Full programmability with public and private state",
      "TBD: to be delivered",
    ],
  },
];

export const definitionsByGroup = (group: (typeof PROPERTY_GROUPS)[number]): PropertyContent[] =>
  PROPERTY_DEFINITIONS.filter((d) => d.group === group);

export const definitionByName = (name: string): PropertyContent | undefined =>
  PROPERTY_DEFINITIONS.find((d) => d.name === name);
