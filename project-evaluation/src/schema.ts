import type { PropertyDefinition, PropertyGroup } from "./types.js";

export const CATEGORIES = [
  "Stealth addresses",
  "Mixer",
  "Shielded pool",
  "zkWormholes",
  "TEEs",
  "Homomorphic encryption (FHE - HE)",
  "Multi Party Computation (MPC)",
  "Garbled circuits",
  "EVM Obfuscators",
  "Cross-L1 CEX aggregator and mixer",
  "VPN (Private Intents)",
] as const;

export const PROPERTY_DEFINITIONS: PropertyDefinition[] = [
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
    metric: "Yes / Only sender / Only receiver / No",
    inputType: "select",
    options: ["Yes", "Only sender", "Only receiver", "No"],
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
    name: "On-chain gas cost",
    group: "Cost and Performance",
    description: "The gas cost of submitting a transaction on-chain",
    metric: "Cost in gas (native gas value)",
    inputType: "number",
  },
  {
    name: "TPS",
    group: "Cost and Performance",
    description:
      "Realistic throughput potential, considering cryptographic overhead and DA constraints, not just raw block limits",
    metric: "Throughput (median, p95, p99) / Latency / Cost (gas, prover cost estimates)",
    inputType: "text",
  },
  {
    name: "Feasible mobile proving",
    group: "Cost and Performance",
    description:
      "If client-side generation is required, can proofs be generated in less than 10 seconds on a mobile device (iPhone 16 Pro)",
    metric: "Yes / No + seconds",
    inputType: "select",
    options: ["Yes", "No", "N/A"],
  },
  {
    name: "Client-side proof generation time",
    group: "Cost and Performance",
    description:
      "If client-side generation is required, the time required to generate a client-side proof on a 2023 14-inch MacBook M3 Pro with 36 GB memory",
    metric: "Seconds",
    inputType: "number",
  },
  {
    name: "Time-to-finality",
    group: "Cost and Performance",
    description:
      "The time it takes for a transaction to be considered irreversible and permanently part of the blockchain",
    metric: "Minutes",
    inputType: "number",
  },

  // ── UX ───────────────────────────────────────────────────────────────────
  {
    name: "Additional secrets",
    group: "UX",
    description:
      "Whether additional secret keys are required to use the protocol. The key may be stored within the application",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
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
    description: "Ability to use the protocol without any restriction or regulation",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },
  {
    name: "External network dependence",
    group: "Decentralization & Security",
    description: "Whether the protocol relies on an external network with additional crypto-economic assumptions",
    metric: "Yes permissioned / Yes permissionless / No",
    inputType: "select",
    options: ["Yes, permissioned", "Yes, permissionless", "No"],
  },
  {
    name: "Walkaway test",
    group: "Decentralization & Security",
    description: "Whether the system continues to function if the core team stops maintaining it",
    metric: "No / Anyone can step in to run the required services / Yes",
    inputType: "select",
    options: ["No", "Anyone can step in to run the required services", "Yes"],
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
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },
  {
    name: "Third-party inspectability",
    group: "Decentralization & Security",
    description: "Can a third party or parties inspect the privacy of users",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },
  {
    name: "Implementation maturity",
    group: "Decentralization & Security",
    description:
      "How developed and battle-tested the protocol is, measured by type of deployment, production readiness, and time on mainnet. Scale 1–5.",
    metric:
      "1 – Prototype/devnet  2 – Public testnet  3 – Mainnet < 1 year  4 – Mainnet > 1 year  5 – Mainnet > 2 years",
    inputType: "select",
    options: ["1 – Prototype / devnet", "2 – Public testnet", "3 – Mainnet < 1 year", "4 – Mainnet > 1 year", "5 – Mainnet > 2 years"],
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
    description: "Where is compliance enforced in the protocol",
    metric: "Asset / App / Protocol/chain / None",
    inputType: "select",
    options: ["Asset", "App", "Protocol/chain", "None"],
  },
  {
    name: "Enforcement entities",
    group: "Compliance",
    description: "Which entity or entities enforce compliance restrictions",
    metric: "DAO/Governance / Third party / Admin / Asset issuer",
    inputType: "select",
    options: ["DAO/Governance", "Third party", "Admin", "Asset issuer"],
  },
  {
    name: "Type of compliance",
    group: "Compliance",
    description: "What type of compliance is being enforced",
    metric: "POI/ASP / KYC/KYB / KYT / Programmatic policies / Other",
    inputType: "select",
    options: ["Proof of innocence (POI) / ASP", "KYC/KYB", "KYT", "Programmatic policies", "Other"],
  },
  {
    name: "Point of enforcement",
    group: "Compliance",
    description: "Where compliance is enforced in the private transfer lifecycle",
    metric: "Deposit / Transfer / Withdrawal",
    inputType: "select",
    options: ["Deposit", "Transfer", "Withdrawal"],
  },
  {
    name: "Selective disclosure: viewing entity",
    group: "Compliance",
    description: "The ability to share only what's needed with a specific entity",
    metric: "User / Voluntary third-party / Involuntary third-party / Protocol",
    inputType: "select",
    options: ["User", "Voluntary third-party disclosure", "Involuntary third-party disclosure", "Protocol"],
  },
  {
    name: "Selective disclosure: viewing control",
    group: "Compliance",
    description: "How selective disclosure viewing control is managed",
    metric: "Pre-defined / Programmable",
    inputType: "select",
    options: ["Pre-defined", "Programmable"],
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
      "The source code for the underlying protocol, backend infrastructure, and frontend applications is publicly available with an open source license",
    metric: "Yes / No",
    inputType: "select",
    options: ["Yes", "No"],
  },

  // ── State ────────────────────────────────────────────────────────────────
  {
    name: "Scalable state",
    group: "State",
    description: "How protocol-specific data is stored over time",
    metric: "Infinity grow / Temporal grow / Stateless",
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
      "Whether the solution can be used directly with DeFi applications",
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
    description: "Range and expressiveness of private logic",
    metric: "Only payments / Partial / Full programmability",
    inputType: "select",
    options: ["Only payments", "Partial programmability", "Full programmability with public and private state"],
  },
];

/** Group definitions ordered for display */
export const PROPERTY_GROUPS: PropertyGroup[] = [
  "Privacy",
  "Cost and Performance",
  "UX",
  "Decentralization & Security",
  "Compliance",
  "Verifiable",
  "State",
  "Composability",
];

export const definitionsByGroup = (group: PropertyGroup): PropertyDefinition[] =>
  PROPERTY_DEFINITIONS.filter((d) => d.group === group);

export const definitionByName = (name: string): PropertyDefinition | undefined =>
  PROPERTY_DEFINITIONS.find((d) => d.name === name);
