import type { PropertyContent } from "./types.js";

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
    description: "The asset being transferred is private",
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
    description:
      "The time it takes for a transaction is considered irreversible and permanently part of the blockchain",
    metric: "Minutes",
    inputType: "number",
  },

  // ── UX ───────────────────────────────────────────────────────────────────
  {
    name: "Number of secrets",
    group: "UX",
    description:
      "How many secrets does the app or protocol require a user to store? For example some protocols (e.g. Tornado Cash) might require a Ethereum wallet (secret #1) and a seed phrase (secret number #2). If there is more than one way to use the protocol (wallets, web apps, etc.), add an explanation to the description",
    metric: "Number of secrets",
    inputType: "number",
  },
  {
    name: "Deposit time",
    group: "UX",
    description: "Duration required before you can deposit into the protocol",
    metric: "Seconds",
    inputType: "number",
  },
  {
    name: "Withdraw time",
    group: "UX",
    description: "Duration required before you can withdraw funds from the protocol",
    metric: "Seconds",
    inputType: "number",
  },

  // ── Decentralization & Security ──────────────────────────────────────────
  {
    name: "Censorship resistance",
    group: "Decentralization & Security",
    description: "Ability to use the protocol without any restriction or being censored",
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
      "Whether users can withdraw shielded funds relying only on Ethereum consensus, smart contracts, and cryptography",
    metric: "No / Can exit in a time period / Instantly",
    inputType: "select",
    options: ["No", "Can exit in a time period", "Instantly"],
  },
  {
    name: "Upgradeability",
    group: "Decentralization & Security",
    description: "How upgrades to the system are performed",
    metric: "Single admin / Multi-sig / DAO / Immutable",
    inputType: "select",
    options: ["Single admin", "Multi-sig", "DAO", "Immutable"],
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
    description: "Which entity or entities enforce compliance restrictions",
    metric: "DAO/Governance / Third party / Admin / Asset issuer / None",
    inputType: "select",
    options: ["DAO/Governance", "Third party", "Admin", "Asset issuer", "None"],
  },
  {
    name: "Type of compliance",
    group: "Compliance",
    description: "What type of compliance is being enforced",
    metric: "POI/ASP / Selective disclosure / KYC/KYB / KYT / Programmatic policies / Other / None",
    inputType: "multi-select",
    options: [
      "Proof of innocence (POI) / ASP",
      "Selective disclosure",
      "KYC/KYB",
      "KYT",
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
      "The ability to share only what's needed (e.g. proving you own an NFT without revealing your entire wallet history)",
    metric: "User / Voluntary third-party / Involuntary third-party / Protocol / None",
    inputType: "multi-select",
    options: ["User", "Voluntary third-party disclosure", "Involuntary third-party disclosure", "Protocol", "None"],
  },
  {
    name: "Selective disclosure: viewing control",
    group: "Compliance",
    description: "How selective disclosure viewing control is managed",
    metric: "Pre-defined / Programmable / None",
    inputType: "select",
    options: ["Pre-defined", "Programmable", "None"],
  },

  // ── Verifiable ───────────────────────────────────────────────────────────
  {
    name: "Cryptographic verifiability",
    group: "Verifiable",
    description: "Whether correctness is guaranteed by cryptography rather than social or majority-based mechanisms",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },
  {
    name: "Open source",
    group: "Verifiable",
    description:
      "The source code for the underlying protocol, any backend infrastructure, and any frontend applications is publicly available to inspect and has an open source software license.",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },

  // ── State ────────────────────────────────────────────────────────────────
  {
    name: "Scalable state",
    group: "State",
    description: "How protocol-specific data is stored over time",
    metric: "Infinity grow / L2 / Temporal grow / Stateless / Within contract",
    inputType: "select",
    options: ["Infinity grow", "L2", "Temporal grow", "Stateless", "Within contract"],
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
    name: "On-chain storage",
    group: "State",
    description: "Where the submitted on-chain data is stored",
    metric: "Off-chain with on-chain commitment / Events / Smart contracts",
    inputType: "select",
    options: ["Off-chain storage with on-chain commitment", "Events", "Smart contracts"],
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
