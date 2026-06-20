import { type Evaluation } from "../src/types";

export type ProtocolConfig = Omit<Evaluation, "properties"> & {
  /** Extra context injected into every research and evaluation prompt. Use this to
   *  clarify what the protocol actually is vs. related specs, prevent common mistakes, etc. */
  context?: string;
};

export const configs: Record<string, ProtocolConfig> = {
  "zcash": {
    id: "zcash",
    title: "ZCash",
    description:
      "A privacy-focused cryptocurrency using zk-SNARKs to enable fully shielded transactions" +
      " where sender, receiver, and amount are all encrypted on its own proof-of-work blockchain.",
    status: "complete",
    documentation: "https://zcash.readthedocs.io/en/latest/",
    categories: ["Private L1"],
    sourceUrls: [
      "https://maxdesalle.com/mastering-zcash",
      "https://seanbowe.com/blog/tachyaction-at-a-distance/",
      "https://zcash.readthedocs.io/en/latest/",
      "https://zcash.github.io/",
    ],
  },
  "worm": {
    id: "worm",
    title: "WORM",
    description:
      "The WORM is an ERC-20 token which is minted via the process of burning Ethereum (ETH) by sending it to unclaimable addresses. Users generate a proof-of-burn receipt which enables the minting of WORM. ETH transfers sent to an unclaimable address are indistinguishable from a regular ETH transfer to a fresh address. There is no way for an outside observer to detect whether a user is interacting with the WORM protocol. The protocol is based on EIP-7503, which standardizes Private Proof-of-Burn. The protocol introduces per-block emission limits to cap WORM token inflation.",
    status: "complete",
    documentation: "https://github.com/worm-privacy/whitepaper",
    categories: ["Zero-Knowledge Wormholes"],
    sourceUrls: [
      "https://github.com/worm-privacy/whitepaper",
      "https://eips.ethereum.org/EIPS/eip-7503",
      "https://github.com/worm-privacy/proof-of-burn",
      "https://github.com/worm-privacy/worm",
      "https://github.com/worm-privacy/miner",
    ],
    context:
      "CRITICAL: WORM is an APPLICATION-LAYER smart contract protocol deployed on Ethereum mainnet. " +
      "It is NOT the same as EIP-7503. EIP-7503 proposes a consensus-layer change to Ethereum (a new " +
      "transaction type that mints native ETH). WORM instead implements the proof-of-burn concept " +
      "entirely at the app layer using deployed smart contracts — no Ethereum client changes are needed. " +
      "WORM has two tokens: BETH (an ERC-20 proof-of-burn receipt, 1:1 with burned ETH) and WORM " +
      "(a scarce ERC-20 minted from BETH at 50 per 30-minute epoch). The contracts are deployed on " +
      "Ethereum mainnet (BETH: 0x5624344235607940d4d4EE76Bf8817d403EB9Cf8, WORM: " +
      "0xfC9d98CdB3529F32cD7fb02d175547641e145B29). The proof-of-burn uses Circom circuits with " +
      "Poseidon2 hashing (not SHA256), Keccak256 for PoW, and Merkle-Patricia-Trie state proofs. " +
      "Do NOT describe EIP-7503 mechanisms (new tx types, SSTORE at WORMHOLE_NULLIFIER_ADDRESS, " +
      "consensus-level minting of native ETH) as if they apply to WORM. Use the EIP only for " +
      "additional reading and background context on the proof-of-burn concept. Always prefer the " +
      "WORM whitepaper and GitHub repos as primary sources.",
  },
  "zerc20": {
    id: "zerc20",
    title: "zERC20",
    description:
      'zERC20 is a fully ERC-20 compliant crosschain private transfer token. Users can perform private transfers directly from standard wallets like MetaMask—no special software required. From an external observer\'s perspective, private transfers are indistinguishable from regular transfers.ERC-20 Compatible: Works with any wallet, DEX, or DeFi protocol that supports standard ERC-20 tokens. Private Transfers: Send tokens without revealing the link between sender and recipient addresses Crosschain Support: Transfer privately across multiple blockchains via LayerZero. No Special Wallet Required: Use MetaMask or any standard Ethereum wallet. It works by A temporary "burn address" is cryptographically generated. The sender transfers zERC20 to this burn address (the tokens are effectively burned). The recipient withdraws the same amount to any address using a zero-knowledge proof. The link between the burn address and the withdrawal address is never revealed on-chain.',
    status: "pending",
    documentation: "https://zerc20.gitbook.io/zerc20",
    categories: ["Zero-Knowledge Wormholes"],
    sourceUrls: ["https://zerc20.gitbook.io/zerc20"],
  },
  "curvy": {
    id: "curvy",
    title: "Curvy",
    description:
      "Curvy is a privacy-preserving cross-chain payment protocol with compliance features. It combines stealth addressses with ZK-SNARKs",
    status: "complete",
    documentation: "https://docs.curvy.box/",
    categories: ["Stealth Addresses"],
    sourceUrls: [
      "https://docs.curvy.box/",
      "https://docs.curvy.box/for-the-curious/",
      "https://docs.curvy.box/for-the-curious/walkthroughs/receiving-funds-privately",
      "https://docs.curvy.box/for-the-curious/walkthroughs/sending-funds-privately",
      "https://docs.curvy.box/for-the-curious/walkthroughs/unshielding-funds-privately",
      "https://docs.curvy.box/for-the-curious/privacy-model.html",
      "https://docs.curvy.box/for-the-curious/compliance-model.html",
      "https://docs.curvy.box/for-the-curious/building-blocks/",
      "https://github.com/0xCurvy/contracts",
      "https://docs.curvy.box/faq.html",
    ],
  },
  "nullmask": {
    id: "nullmask",
    title: "Nullmask",
    description:
      "Nullmask is a privacy layer that sits between an ordinary wallet (e.g. MetaMask) and a chain via a custom RPC proxy. Users sign a single authorization message to derive viewing, nullifying and encryption keys; the proxy converts a user's normal transactions into shielded UTXO-style 'Notes' and produces UltraHonk zk-SNARK proofs (~2s) for deposits, transfers and withdrawals. Shielded state is represented as encrypted notes on-chain alongside a key registry; users trial-decrypt notes to find their own. Retroactive compliance allows flagged deposits to be revoked.",
    status: "pending",
    documentation: "https://nmskdiagram.vercel.app/",
    categories: ["Virtual Private EVM Network"],
    sourceUrls: [
      "https://nullmask.io/",
      "https://nmskdiagram.vercel.app/",
      "https://hackmd.io/@krnak/Sy5zROAFWx",
      "https://hackmd.io/@krnak/r1W6uGUsZe",
    ],
  },
  "houdiniswap": {
    id: "houdiniswap",
    title: "Houdini Swap",
    status: "pending",
    description:
      "Houdini Swap is a non-custodial cross-chain liquidity aggregator that obtains privacy by routing each swap through two independent off-chain CEX partners and three separate blockchains, so no single counterparty sees the full path from source to destination. It is not a mixer: liquidity is not pooled and no zero-knowledge proofs are used; privacy comes from partitioning knowledge across routing hops. The service aggregates DEXes and bridges across 100+ chains and curates CEX partners that run industry-standard AML programmes.",
    documentation: "https://docs.houdiniswap.com/",
    categories: ["Cross-Chain Swap Aggregator"],
    sourceUrls: [
      "https://docs.houdiniswap.com/overview/getting-started/what-is-houdini",
      "https://docs.houdiniswap.com/overview/getting-started/core-swap-concepts",
      "https://docs.houdiniswap.com/overview/getting-started/privacy-and-compliance",
      "https://docs.houdiniswap.com/overview/swaps-and-transfers/private-swaps",
      "https://docs.houdiniswap.com/overview/coverage-and-economy/chain-tokens-partners",
      "https://docs.houdiniswap.com/overview/coverage-and-economy/monetization-and-fees",
      "https://docs.houdiniswap.com/developer-hub/overview/architecture",
      "https://docs.houdiniswap.com/developer-hub/core-concepts/routing-types",
      "https://docs.houdiniswap.com/products/swap-transfer/compliance-policy",
    ],
    context:
      "Houdini Swap is explicitly NOT a mixer and NOT a zero-knowledge privacy protocol. Its privacy model is 'knowledge partitioning across off-chain CEX hops and multiple blockchains': two non-custodial CEX partners and three blockchains are used so no single party sees the full source-to-destination path. Do not describe Houdini as a shielded pool, ZK rollup, or anonymity-set protocol. There are no on-chain privacy contracts, no notes, and no nullifiers — routing and compliance happen off-chain via CEX partners and a proprietary routing engine.",
  },
  "mirage": {
    id: "mirage",
    title: "Mirage",
    description:
      "Mirage is a privacy layer for stablecoin transfers on Ethereum L1 that makes private transactions indistinguishable from ordinary onchain activity. It avoids shared pools by using per-transaction escrow contracts whose EVM bytecode is obfuscated by Azoth, an open-source Rust obfuscator that produces many deterministic variants of the same contract logic. Execution is carried out by a decentralised set of Nomad operator nodes that post bonds into the escrow and earn rewards for settling transfers. The protocol is currently in closed alpha with a public test environment in preparation.",
    status: "pending",
    documentation: "https://docs.mirageprivacy.com/",
    categories: ["Bytecode Obfuscator"],
    sourceUrls: [
      "https://docs.mirageprivacy.com/understanding-mirage/introduction",
      "https://docs.mirageprivacy.com/understanding-mirage/how-mirage-compares",
      "https://docs.mirageprivacy.com/understanding-mirage/the-undetectability-challenge",
      "https://docs.mirageprivacy.com/understanding-mirage/a-simple-example",
      "https://docs.mirageprivacy.com/azoth/introduction/",
      "https://docs.mirageprivacy.com/nomad/overview/",
      "https://docs.mirageprivacy.com/faq/general",
      "https://docs.mirageprivacy.com/faq/compliance",
      "https://docs.mirageprivacy.com/faq/technical",
      "https://blog.mirageprivacy.com/posts/introducing-mirage",
      "https://blog.mirageprivacy.com/posts/introducing-azoth",
      "https://github.com/MiragePrivacy/azoth",
      "https://github.com/MiragePrivacy/escrow",
    ],
    context:
      "Mirage's privacy model is NOT a shielded pool, mixer, or ZK rollup. It avoids pooled funds entirely. Each private transfer deploys a transaction-specific escrow contract; Azoth obfuscates the bytecode so the contract is indistinguishable from any other unverified deployment. A decentralised Nomad network settles transfers against the escrow using time-bonded execution. As of April 2026 the protocol is in closed alpha, with a public test environment in preparation — do not report it as mainnet-live. SGX is used by Nomad operators for node-side key handling.",
  },
  "aztec": {
    id: "aztec",
    title: "Aztec",
    description:
      "Aztec is a privacy-first zkRollup Layer 2 on Ethereum where smart contracts can have both private and public state and functions. Private functions execute locally in the user's Private Execution Environment (PXE) and generate client-side zero-knowledge proofs. Public functions execute on the sequencer like an EVM L2. Private state is held as encrypted note commitments with nullifiers. Public state is an account-based store. Contracts are written in Noir.",
    status: "pending",
    documentation: "https://docs.aztec.network/",
    categories: ["Private L2", "Zero Knowledge Proofs (ZKPs)", "Shielded Pool"],
    sourceUrls: [
      "https://docs.aztec.network/",
      "https://docs.aztec.network/aztec",
      "https://docs.aztec.network/aztec/concepts/advanced/storage/private_state",
      "https://docs.aztec.network/aztec/concepts/advanced/storage/public_state",
      "https://docs.aztec.network/aztec/concepts/pxe",
      "https://docs.aztec.network/aztec/concepts/transactions",
      "https://docs.aztec.network/aztec/concepts/wallets/keys",
      "https://docs.aztec.network/aztec/concepts/network/nodes_clients",
      "https://docs.aztec.network/aztec/concepts/network/sequencers",
      "https://docs.aztec.network/aztec/concepts/network/provers",
      "https://docs.aztec.network/aztec/concepts/network/governance",
      "https://docs.aztec.network/protocol-specs",
      "https://noir-lang.org/docs",
      "https://aztec.network/",
      "https://github.com/AztecProtocol/aztec-packages",
    ],
    context:
      "CRITICAL: 'Aztec' here means the Aztec Network zkRollup L2 — Alpha mainnet on Ethereum went live in early 2026 atop the Aztec Ignition Chain which launched in November 2025 — NOT the deprecated 'Aztec Connect' shielded-pool product (shut down in 2024). Do not cite Aztec Connect docs, contracts, or design as if they describe the current protocol. Aztec smart contracts are written in Noir; private execution happens client-side in the PXE (Private Execution Environment) and produces a ZK proof that is verified by the sequencer/prover network. Private state uses note commitments + nullifiers; public state uses an account-based store; both live in the same rollup. Alpha is presented as the operational mainnet in its initial phase — early, with known critical bugs — so treat maturity / live-deployment claims accordingly and prefer dated docs / blog posts as evidence.",
  },
  "umbra-cash": {
    id: "umbra-cash",
    title: "Umbra Cash",
    description:
      "Umbra is a stealth-address protocol for Ethereum. A payer sends funds to a fresh address controlled by the intended recipient. Only the payer and recipient can link that address to the recipient.",
    status: "pending",
    documentation: "https://app.umbra.cash/faq",
    categories: ["Stealth Addresses"],
    sourceUrls: [
      "https://app.umbra.cash/faq",
      "https://github.com/ScopeLift/umbra-protocol",
      "https://github.com/ScopeLift/umbra-protocol/blob/master/contracts-core/README.md",
      "https://github.com/ScopeLift/umbra-protocol/tree/master/contracts-core/contracts",
      "https://eips.ethereum.org/EIPS/eip-5564",
      "https://www.scopelift.co/blog/announcing-umbra",
    ],
    context:
      "CRITICAL: 'Umbra Cash' is the ScopeLift Ethereum stealth-address protocol at app.umbra.cash — NOT the Solana protocol 'Umbra Privacy' tracked under id 'umbra'. Privacy model: stealth addresses on L1 Ethereum (also deployed on several EVM L2s). A payer sends funds to a one-time stealth address derived from the recipient's published stealth meta-address; the recipient discovers the address by scanning Announcement events with their viewing key. No shielded pool, no zk runtime — privacy is unlinkability via fresh per-payment addresses. Two protocol contracts on each chain: StealthKeyRegistry (publishes meta-addresses) and Umbra (sends funds + emits Announcement events). Contracts are typically immutable. EIP-5564 standardizes the stealth-address scheme that post-dates Umbra; use it for design context, not as the deployment claim.",
  },
  "blanksquare": {
    id: "blanksquare",
    title: "Blanksquare",
    description:
      "Blanksquare is a composable privacy stack for EVM wallets and DeFi apps developed by Cardinal Cryptography. The Shielder SDK lets any ERC-20 token be deposited into a shielded pool that uses zk-SNARKs to break linkability between deposit and withdrawal addresses. Designed for integration into wallets and DeFi protocols with 600-800ms proving on consumer hardware.",
    status: "pending",
    documentation: "https://docs.blanksquare.io/",
    categories: ["Shielded Pool", "Zero Knowledge Proofs (ZKPs)"],
    sourceUrls: [
      "https://blanksquare.io/",
      "https://docs.blanksquare.io/",
      "https://docs.blanksquare.io/protocol-details/shielder",
      "https://docs.blanksquare.io/integration-guides/quickstart",
      "https://docs.blanksquare.io/protocol-details/design-against-bad-actors/anonymity-revokers",
      "https://github.com/Cardinal-Cryptography/blanksquare-monorepo",
      "https://reports.zksecurity.xyz/reports/aleph-zero-shielder/",
    ],
    context:
      "CRITICAL: Blanksquare is the rebranded / EVM-targeted version of the Aleph Zero Shielder, developed by Cardinal Cryptography. It is a shielded-pool protocol for ERC-20 tokens with zk-SNARK proofs using Halo2 (600-800ms client-side). Three core circuits: Deposit, Withdraw, New Account. Anonymity-Revoking is the built-in selective-disclosure / compliance mechanism — governance-triggered deanonymization of specific deposits (NOT user-discretionary; user encrypts key(id) to the AR's public key at first deposit). Apache-2.0 licensed core, GPL-3.0-with-Classpath-exception for circuits. Audited by zkSecurity (report at reports.zksecurity.xyz/reports/aleph-zero-shielder). Deployed on Base Sepolia testnet (Shielder contract 0x2098a5f59DAB63F1a2aB7C0715DA437D1efB012B). Light WASM client marked as alpha. No mainnet as of mid-2026.",
  },
  "anoma-pay": {
    id: "anoma-pay",
    title: "Anoma Pay",
    description:
      "AnomaPay is a private payments application built on the Anoma distributed operating system. Users wrap any ERC-20 token into Anoma resources via the EVM Protocol Adapter and send shielded transfers settled back on the host chain. Privacy is enforced by zero-knowledge proofs over the Anoma Resource Machine.",
    status: "pending",
    documentation: "https://docs.anoma.net/",
    categories: ["Shielded Pool", "Zero Knowledge Proofs (ZKPs)"],
    sourceUrls: [
      "https://anomapay.app/",
      "https://docs.anoma.net/",
      "https://github.com/anoma/anomapay-erc20-forwarder",
      "https://github.com/anoma/pa-evm",
      "https://github.com/anoma/anoma-app-sdk",
      "https://anoma.net/",
      "https://anoma.foundation/press/anomapaybeta",
      "https://anoma.net/blog/the-anomapay-public-beta-is-live-on-bnb-chain",
    ],
    context:
      "CRITICAL: 'Anoma Pay' (AnomaPay) is the private-payments app at anomapay.app built atop the Anoma distributed OS — NOT the broader Anoma intent architecture and NOT the Namada chain. AnomaPay specifically wraps host-chain ERC-20s into Anoma Resource Machine 'resources' via the anomapay-erc20-forwarder Solidity contract, settles ZK-proven shielded transfers through the pa-evm Protocol Adapter, and unwraps back into ERC-20s on the host chain. Address format: Base64URL-encoded 135-byte tuple of Authority pubkey + Discovery pubkey + Encryption pubkey + Nullifier Key Commitment + CRC32 checksum (per anoma-app-sdk). Audited by Informal Systems (Oct-Nov 2025) and Nethermind (Oct-Nov 2025). Public beta launched 2 April 2026 on BNB Chain, preceded by a private beta on Base. Anoma DOS itself is live on Ethereum mainnet, Base, Arbitrum, Optimism, and Aurora. ZK proving ~15 seconds; client-side proving in development. Selective disclosure for auditors/regulators. Closed-source compliance: 'Compliance primitives are built into the protocol, not bolted on top'.",
  },
  "scroll-cloak": {
    id: "scroll-cloak",
    title: "Scroll Cloak",
    description:
      "Scroll Cloak is a ZK-based privacy execution layer on Scroll L2 targeted at on-chain finance. Each transaction is processed inside a private ledger with hidden balances and details, while ZK proofs guarantee integrity publicly. Includes full EVM support for private smart contracts plus KYB/KYC hooks, real-time monitoring, and selective-disclosure APIs for compliance. The first version is live on Scroll's testnet.",
    status: "pending",
    documentation: "https://scroll.io/cloak",
    categories: ["Private Validium", "Zero Knowledge Proofs (ZKPs)"],
    sourceUrls: ["https://scroll.io/cloak", "https://scroll.io/blog/introducing-cloak"],
    context:
      "CRITICAL: 'Scroll Cloak' (or 'Cloak') is Scroll's enterprise zk-validium privacy execution layer for on-chain finance, announced August 2025. NOT Ten Protocol's 'Cloak' feature, NOT zCloak Network. Architecture: per-instance deployment with private RPC gateway (authenticates + access control), app-specific sequencer (cloud or on-prem), private indexer, dedicated zk provers, and bridge contracts on Scroll L2 that settle proofs+state-roots to Ethereum L1 (only proofs + state roots posted — validium data availability). Enterprise customer retains sovereignty: controls bridge contracts, sequencer (if self-hosted), and admin rights. Full EVM compatibility for private smart contracts. KYB/KYC hooks, real-time monitoring, and selective-disclosure APIs are bundled. First version on Scroll testnet as of announcement; check current status during Phase A. Compliance is built-in (regulator-friendly) and the design explicitly targets enterprises rather than retail users.",
  },
  "coti": {
    id: "coti",
    title: "Coti",
    description:
      "COTI is a blockchain network designed to enable computation on encrypted data through the use of Garbled Circuits. COTI can be used under the hood to build private ERC20 tokens and deploy it on any EVM-compatible chain.",
    status: "pending",
    documentation: "https://docs.coti.io/coti-documentation/",
    categories: ["Garbled Circuits", "Multi Party Computation (MPC)", "Private L2"],
    sourceUrls: [
      "https://coti.io/files/coti_v2_whitepaper.pdf",
      "https://docs.coti.io/coti-documentation/",
      "https://docs.coti.io/coti-documentation/how-coti-works/advanced-topics/garbled-circuits",
      "https://docs.coti.io/coti-documentation/build-on-coti/tools/contracts-library/tokens/private-erc20",
      "https://github.com/coti-io/documentation",
    ],
    context:
      "CRITICAL: This evaluation is about COTI V2 — the 'Confidential Computing Ethereum Layer 2' that brings " +
      "on-chain confidentiality to EVM smart contracts using Garbled Circuits (GC) and secure multi-party " +
      "computation (MPC). It is NOT COTI V1, which was a DAG-based (Trustchain) payment network with a different " +
      "architecture; the COTI token migrated from V1 to V2. Privacy on COTI V2 comes from Garbled Circuits + MPC, " +
      "NOT from FHE and NOT from zero-knowledge proofs — COTI explicitly positions GC against FHE (claiming ~1000x " +
      "faster compute, ~100x lower latency, ~250x smaller storage). The execution environment is the gcEVM, which " +
      "adds confidential data types (e.g. ctUint / garbled ciphertext types) and a privacy precompile so Solidity " +
      "contracts can compute over encrypted values. The flagship application primitive is the private ERC-20 " +
      "(gcERC20 / 'PrivateERC20'), where balances and transfer amounts are encrypted on-chain; users hold an " +
      "AES key (derived via onboarding to the network MPC) that lets them decrypt their own values, and selective " +
      "disclosure is possible by sharing that key or re-encrypting to a viewer. Computation is performed by a " +
      "committee of MPC nodes that jointly evaluate the garbled circuit without any single node learning the " +
      "cleartext. Prefer the COTI V2 whitepaper (coti.io/files/coti_v2_whitepaper.pdf) and docs.coti.io as primary " +
      "sources. Do NOT attribute V1 DAG/Trustchain mechanisms to V2, and do NOT describe COTI as an FHE or ZK system.",
  },
  "miden": {
    id: "miden",
    title: "Miden",
    description:
      "Miden is a zero-knowledge rollup focused on programmable privacy for on-chain finance, spun out of Polygon Labs into an independent network. Accounts and notes are private by default: transactions are executed and proven client-side, producing a STARK proof, and only commitments (not the underlying data) are published to the network. Global state is split across an account database, an append-only note database, and a nullifier database, combining account-based and UTXO-style (note) models. Notes carry spend scripts, enabling expressive, locally-executed private smart contracts. Miden is STARK-based and quantum-resistant.",
    status: "pending",
    documentation: "https://docs.miden.xyz/",
    categories: ["Private L2", "Shielded Pool", "Zero Knowledge Proofs (ZKPs)"],
    sourceUrls: [
      "https://docs.miden.xyz/reference/protocol/",
      "https://docs.miden.xyz/builder/smart-contracts/accounts/introduction",
      "https://docs.miden.xyz/builder/smart-contracts/notes/introduction",
      "https://docs.miden.xyz/builder/smart-contracts/transactions/introduction",
      "https://docs.miden.xyz/builder/miden-guardian/",
      "https://miden.xyz/resource/blog/privacy",
      "https://miden.xyz/resource/blog/testnet-november-2025",
      "https://github.com/0xMiden",
    ],
    context:
      "CRITICAL: 'Miden' is the standalone zero-knowledge rollup that spun out of Polygon Labs on 29 April 2025 (raising $25M seed; formerly 'Polygon Miden') — evaluate the independent Miden network, NOT Polygon's zkEVM or Polygon PoS. Privacy model: accounts and notes can each be stored Publicly (on-chain, fully visible) or Privately/off-chain (only a commitment/hash on-chain). For a private note the network sees only the note hash and the sender (and the sender can be masked via relay accounts); a public note reveals sender, recipient and assets. Execution and proving happen client-side — the user generates a STARK proof per transaction in the Miden VM; the operator/sequencer verifies proofs and orders blocks. IMPORTANT maturity nuance: Miden is testnet-only as of mid-2026 (testnet ~v0.13/v0.14), with mainnet targeted for 2026 — do NOT report it as mainnet-live. A transitional 'privacy training wheels' measure means that on testnet and at initial mainnet, clients send all transaction data plus the proof to the operator, so the operator can see transaction data (Web2-like privacy) until full client-side data withholding is enabled. Cryptography is STARK-based (hash-based, no trusted setup, quantum-resistant). Compliance is via selective disclosure — data hidden from the network and competitors but discloseable to auditors. Prefer docs.miden.xyz and the 0xMiden GitHub as primary sources; miden.xyz blog posts are acceptable for dated maturity claims.",
  },
  "fluton": {
    id: "fluton",
    title: "Fluton",
    description:
      "Fluton is a confidential execution layer for blockchains that uses homomorphic encryption. Its intent-based design moves privacy out of individual protocols and chains, treating it as a shared execution primitive.",
    status: "pending",
    documentation: "https://docs.fluton.io/introduction",
    categories: ["Fully Homomorphic encryption (FHE)", "Decentralised Network"],
    sourceUrls: [
      "https://docs.fluton.io/introduction",
      "https://docs.fluton.io/confidential-architecture",
      "https://docs.fluton.io/cERC20",
      "https://docs.fluton.io/proof-of-innocence",
      "https://docs.fluton.io/supported-networks-addresses",
    ],
    context:
      "CRITICAL: Fluton is a 'universal confidential execution layer' (CEL) for blockchains — intent-based, " +
      "cross-chain confidential swaps, bridging, payments, and yield. Privacy is FHE-based: smart contracts use " +
      "Zama and Fhenix FHE coprocessors to compute on encrypted data, and the confidential token primitive is the " +
      "cERC20, an ERC-7984 Confidential Fungible Token (wrap/shield public tokens 1:1 into encrypted cERC20s — " +
      "cUSDC, cUSDT, cDAI, etc.). Users sign an ENCRYPTED INTENT and a decentralized network of solvers fulfils it " +
      "through a four-plane CEL (Intent, Routing, Adapter, Protocol planes); confidentiality adapters batch and " +
      "submit actions to existing protocol contracts without changing them. Amounts, balances, portfolio, " +
      "strategies, and address linkage are encrypted, but the FACT a transaction occurred is visible, and the " +
      "ENTRY POINT leaks (the 'Entry Leak Problem' — at shield time you reveal your address and shielded amount; " +
      "once inside you can stay private). Compliance: Proof of Innocence (POI) is auto-generated on every intent " +
      "(prove not-on-a-blacklist without revealing identity), plus selective disclosure to authorized parties. " +
      "STATUS as of 2026: TESTNET ONLY — deployed on Ethereum Sepolia, Arbitrum Sepolia, and Base Sepolia; the " +
      "private testnet is closed and a public testnet is in progress; the SDK is not yet published; NO mainnet. " +
      "Treat maturity as early testnet. Open source: the fluton-relayer repo is public; the SDK is unpublished. " +
      "Prefer docs.fluton.io pages as primary sources.",
  },
  "fairblock": {
    id: "fairblock",
    title: "Fairblock",
    description:
      "Fairblock is a decentralized cryptographic computer with its own execution layer for confidential computing. Confidential apps (cApps) run on Fairblock's native chain, FairyRing, and are accessible from major ecosystems, so users can use them without bridging funds or switching wallets.",
    status: "pending",
    documentation: "https://docs.fairblock.network/docs/welcome/vision",
    categories: [
      "Zero Knowledge Proofs (ZKPs)",
      "Homomorphic Encryption (HE)",
      "Multi Party Computation (MPC)",
      "Decentralised Network",
    ],
    sourceUrls: [
      "https://docs.fairblock.network/docs/welcome/vision",
      "https://www.fairblock.network/how-it-works",
      "https://www.fairblock.network/capps",
      "https://stabletrust.io/",
    ],
    context:
      "CRITICAL: For 'The State of Private Transfers', the load-bearing product is STABLETRUST — Fairblock's " +
      "confidential stablecoin cApp that lets users 'send and receive stablecoins with encrypted amounts and " +
      "balances on public chains'. Evaluate the private-transfer experience through Stabletrust, with Fairblock / " +
      "FairyRing as the underlying confidential-computing network. Fairblock uses 'multimodal cryptography' — it " +
      "selects the scheme per use case (identity-based encryption / threshold IBE, homomorphic encryption, MPC, " +
      "and lightweight ZK), NOT a single primitive; do not describe it as a pure-FHE or pure-ZK system. cApps run " +
      "on FairyRing (Fairblock's native chain) and are reachable from EVM, Solana, and Stellar without bridging. " +
      "Key design point: amounts and balances are encrypted but ADDRESSES REMAIN TRANSPARENT for DeFi composability " +
      "and traceability — so Confidentiality is high while Anonymity is not provided. Correctness and validity are " +
      "verified on-chain rather than by an opaque off-chain processor. Prefer docs.fairblock.network and the " +
      "Stabletrust product docs as primary sources; stabletrust.io is the canonical product page. Distinguish live " +
      "features from roadmap during Phase A.",
  },
  "merces": {
    id: "merces",
    title: "Merces",
    description:
      "Merces by TACEO is an implementation of Private Shared State (PSS), providing a confidential stablecoin transfer system. It is deployed on Base and the Arc testnet.",
    status: "pending",
    documentation: "https://docs.taceo.io/docs/finance-solutions/overview/",
    categories: ["CoSNARKs", "Zero Knowledge Proofs (ZKPs)", "Multi Party Computation (MPC)"],
    sourceUrls: [
      "https://docs.taceo.io/docs/finance-solutions/overview/",
      "https://core.taceo.io/articles/merces-deep-dive/",
      "https://core.taceo.io/articles/merces-onchain-finance/",
      "https://github.com/TaceoLabs/co-snarks",
    ],
    context:
      "CRITICAL: Merces is TACEO's confidential token-transfer protocol implementing 'Private Shared State' " +
      "(PSS). It wraps ERC-20 tokens into a private virtual account that sits alongside the user's normal public " +
      "wallet. Architecture: the on-chain smart contract is the ground truth — it holds the actual ERC-20 tokens " +
      "backing all private balances, stores a commitment (Merkle root) to an encrypted balance tree, and maintains " +
      "an ACTION QUEUE where users register intents. Users register intents ON-CHAIN; the TACEO MPC NETWORK (a set " +
      "of THREE computing nodes that jointly hold secret shares of every balance) EXECUTES them OFF-CHAIN; the smart " +
      "contract VERIFIES the result on-chain via CoSNARKs (collaborative SNARKs). No single node knows any balance, " +
      "and no single party (including TACEO) sees what anyone holds or sends. Client-side: the user's wallet builds " +
      "commitments to sender/receiver/amount, encrypted secret shares for the MPC network, and a ZK proof — so " +
      "PROVING IS CLIENT-SIDE and sender/receiver are HIDDEN (a commitment/nullifier shielded model, so Anonymity " +
      "is high, unlike address-transparent confidential-ERC20 systems). On-chain: action queue, commitments, " +
      "nullifiers, encrypted ciphertexts, Merkle roots, ZK proofs. Off-chain: plaintext balances, history, secret " +
      "shares (so Private Data Storage = off-chain storage with on-chain commitment). Compliance: a regulator can " +
      "request revelation — with a signed warrant, the MPC network runs an MPC linear scan over history and opens " +
      "the matching transaction's shares to the regulator (involuntary, warrant-gated selective disclosure). STATUS " +
      "as of 2026: TESTNET — demonstrated on Arc, Base, and Plasma testnets (~5M demo transactions, ~300 TPS); live " +
      "demo app at merces.taceo.io; NO mainnet date documented. The co-snarks library is open source at " +
      "github.com/TaceoLabs/co-snarks. The eprint paper 2026/850 is a PDF — use the core.taceo.io articles and " +
      "docs.taceo.io instead as primary HTML sources.",
  },
  "zksync-prividium": {
    id: "zksync-prividium",
    title: "ZKsync Prividium",
    description:
      "ZKsync Prividium is a permissioned Validium privacy layer built on the ZK Stack, letting an institution run a private instance of a ZKsync chain — with its own sequencer and prover — inside its own infrastructure. Transactions execute privately and state is held off-chain in a secure database, while each batch posts only a state root and a zero-knowledge proof to Ethereum. A proxy RPC enforces role-based, function-level access control with Okta SSO or Sign-In With Ethereum, and operators can selectively disclose data to auditors and regulators.",
    status: "pending",
    documentation: "https://docs.zksync.io/zk-stack/prividium/overview",
    categories: ["Private Validium", "Zero Knowledge Proofs (ZKPs)"],
    sourceUrls: [
      "https://docs.zksync.io/zk-stack/prividium/overview",
      "https://docs.zksync.io/zk-stack/prividium/architecture",
      "https://docs.zksync.io/zk-stack/prividium/features",
      "https://docs.zksync.io/zk-stack/prividium/proxy",
      "https://docs.zksync.io/zk-stack/prividium/permissions-overview",
      "https://docs.zksync.io/zk-stack/prividium/administration-user-management",
      "https://docs.zksync.io/zk-stack/prividium/deployment",
      "https://docs.zksync.io/zk-stack/prividium/developer-considerations",
      "https://docs.zksync.io/zk-stack/prividium/explorer",
      "https://docs.zksync.io/zk-stack/prividium/sdk",
      "https://docs.zksync.io/zk-stack/prividium/license",
      "https://www.zksync.io/prividium",
    ],
    context:
      "CRITICAL: 'ZKsync Prividium' is Matter Labs' permissioned-Validium privacy product built on the ZK Stack — " +
      "a private, access-controlled instance of a ZKsync chain run inside an institution's own infrastructure or " +
      "cloud, NOT the public ZKsync Era L2 and NOT a single shared network. Each customer operates its OWN Prividium " +
      "chain with its own sequencer and prover. Data availability is VALIDIUM: all transaction data and state are " +
      "stored off-chain in a secure database, and only state roots + zk validity proofs are posted to Ethereum L1 " +
      "(via the ZKsync Gateway) — no transaction inputs, addresses, or calldata are inferable from public L1 data. " +
      "Access control: a Proxy RPC is the single entry point that authenticates users (Okta SSO or Sign-In With " +
      "Ethereum / SIWE) and enforces role-based, contract-function-level permissions (e.g. Trader / Auditor / Admin) " +
      "managed via an Admin Dashboard before any request reaches the Sequencer RPC. Compliance is built-in and " +
      "regulator-facing: chain operators can selectively disclose specific data (e.g. bytecode, token supply, a given " +
      "transaction) to auditors or regulators without exposing the full ledger; AML/KYC and address-level identity " +
      "binding are enforced at the base layer. Privacy is confidentiality from the public plus role-gated internal " +
      "access — the chain operator and authorised roles can see transaction data, so there is no anonymity from the " +
      "operator. The design targets regulated institutions (trading, settlement, tokenised funds, payments) rather " +
      "than retail, and it is a LICENSED commercial product. Live institutional use exists — e.g. Deutsche Bank's " +
      "DAMA 2 tokenised-fund platform on the Memento ZK Chain (powered by Prividium) — but verify current deployment " +
      "status and named adopters during Phase A. Prefer docs.zksync.io/zk-stack/prividium pages as primary sources; " +
      "the design paper (zksync.io/papers/beyond_public_vs_private_chains-design.pdf) is a PDF — use it for " +
      "background only.",
  },
  "inco": {
    id: "inco",
    title: "Inco",
    description:
      "Inco is a confidentiality layer for existing EVM blockchains. Its live product, Inco Lightning, lets developers write confidential smart contracts in standard Solidity using encrypted data types (euint, ebool, eaddress). Encrypted values are stored off-chain and referenced on-chain as handles, while confidential computation and decryption run inside Trusted Execution Environments (TEEs). A quorum of TEE-based decryption nodes returns signed attestations that on-chain contracts verify. It is deployed on Base mainnet and Base Sepolia, with a Solana devnet in beta.",
    status: "pending",
    documentation: "https://docs.inco.org",
    categories: ["Trusted Execution Environments (TEEs)", "Encrypted Tokens", "Privacy Stack/Layer/Middleware"],
    sourceUrls: [
      "https://docs.inco.org/introduction",
      "https://docs.inco.org/architecture/overview",
      "https://docs.inco.org/architecture/components",
      "https://docs.inco.org/architecture/decryption-mechanisms",
      "https://docs.inco.org/guide/input",
      "https://docs.inco.org/guide/handles",
      "https://docs.inco.org/guide/guide-access-control",
      "https://docs.inco.org/guide/decryption",
      "https://docs.inco.org/guide/verifying-attestations",
      "https://docs.inco.org/quickstart/fees",
      "https://www.inco.org/blog/inco-lightning-live-on-base-mainnet",
      "https://github.com/Inco-fhevm",
    ],
    context:
      "CRITICAL: Inco today is a TEE-based CONFIDENTIALITY LAYER for existing EVM chains — NOT an FHE L1. The live " +
      "product is Inco Lightning, deployed on Base mainnet (live 15 June 2026, audited by Trail of Bits) and Base " +
      "Sepolia (24 April 2025), with a Solana devnet in beta (9 January 2026). The deployed confidential-compute " +
      "and decryption mechanism is Trusted Execution Environments (TEEs), NOT Fully Homomorphic Encryption. The docs " +
      "say 'TEE' without naming a vendor — a gramine (Intel SGX/TDX-family) fork in the GitHub org corroborates the " +
      "enclave family, but do NOT assert 'Intel TDX' as a documented fact. FHE " +
      "(Zama fhEVM / TFHE) belongs to the OBSOLETE 2023 Cosmos-SDK 'modular confidential computing L1' design and to " +
      "a future, NOT-YET-DEPLOYED engine called 'Inco Atlas' — do NOT describe FHE/TFHE/fhEVM as the live mechanism. " +
      "The newest source describing the deployed system wins; ignore the 2025 roundup's lingering 'FHE' framing. " +
      "Architecture: smart contracts hold only handles (identifiers) for data stored off-chain in encrypted form; a " +
      "Confidential Compute Server runs inside a TEE; user inputs are encrypted client-side to the attested enclave " +
      "public key (no per-user viewing key, and no zero-knowledge proof of plaintext knowledge — inputs are instead " +
      "context-bound to account/chain/contract). Decryption: a user signs an EIP-712 message, then a quorum of " +
      "TEE-based decryption nodes ('covalidators') returns plaintext plus a signed attestation that on-chain " +
      "contracts verify via inco.incoVerifier().isValidDecryptionAttestation(...). Validity/verifiability rests on " +
      "TEE remote attestation plus covalidator signatures, NOT a re-checkable ZK validity proof. Consensus: Inco " +
      "runs NO consensus or sequencer of its own — it RIDES the host chain (Base) for ordering and settlement, and " +
      "fees are paid in the host chain's native currency. Trust assumption: Intel TDX hardware plus the operator(s) " +
      "running the enclaves plus the covalidator quorum (TEE hardware trust, not a cryptographic honest majority); the " +
      "docs do NOT publish an explicit t-of-n threshold or " +
      "honest-majority parameter for the quorum — treat that as under-specified, not a cryptographic honest-majority " +
      "MPC. Access control is on-chain and programmable (e.allow(address) grants permanent per-handle decrypt/compute " +
      "rights), with selective disclosure via attested-decrypt / attested-reveal — there is NO viewing-key scheme, " +
      "NO KYC/AML, and NO blocklist documented. Upgradeability/admin of the core contracts and control of the " +
      "covalidator quorum are NOT documented publicly — flag rather than guess. Open source is partial: client SDKs " +
      "and templates are public (confidential-erc20-framework is MIT; lightning-rod has no detectable licence) but " +
      "the core TEE compute server / covalidator code is NOT open-sourced. Use docs.inco.org as the canonical docs " +
      "origin; AVOID docs.inco.network, which carries legacy fhEVM/L1 material. There is no L2BEAT page (Inco is not " +
      "an L2). GitHub org: https://github.com/Inco-fhevm.",
  },
  "payy": {
    id: "payy",
    title: "Payy",
    description:
      "Payy is a privacy-focused stablecoin payments network built by Polybase Labs, combining a UTXO note-commitment zero-knowledge rollup with a non-custodial mobile wallet and Visa card. Transactions hide sender, receiver, and amount using client-generated ZK proofs over a Merkle tree of note commitments with nullifiers. The network originally ran as a single-sequencer validium settling to Polygon, and is migrating to an Ethereum L2 ZK rollup with its own EVM layer.",
    status: "pending",
    documentation: "https://docs.payy.network",
    categories: ["Private L2", "Shielded Pool", "Zero Knowledge Proofs (ZKPs)"],
    sourceUrls: [
      "https://docs.payy.network/llms-full.txt",
      "https://docs.payy.network/protocol/architecture.md",
      "https://docs.payy.network/protocol/data-availability.md",
      "https://docs.payy.network/protocol/privacy-layer/utxo.md",
      "https://docs.payy.network/protocol/privacy-layer/nullifiers.md",
      "https://docs.payy.network/protocol/privacy-layer/zk-circuits.md",
      "https://docs.payy.network/protocol/privacy-layer/private-address.md",
      "https://docs.payy.network/protocol/privacy-layer/encrypted-lineage.md",
      "https://docs.payy.network/protocol/sequencers.md",
      "https://docs.payy.network/protocol/provers.md",
      "https://github.com/polybase/payy",
    ],
    context:
      "CRITICAL: Payy (Polybase Labs) is a privacy stablecoin PAYMENTS network — a UTXO / note-commitment ZK rollup " +
      "plus a non-custodial consumer mobile wallet (live January 2024) and a Visa card (live August 2025). It is NOT " +
      "an L1 and NOT a general smart-contract platform for others. TWO ARCHITECTURAL ERAS — do not conflate: (1) the " +
      "LIVE consumer product has run as a single-sequencer VALIDIUM settling to Polygon PoS since January 2024 " +
      "(100k+ users); (2) the docs were recently rewritten to describe a redesigned Ethereum L2 ZK ROLLUP with its " +
      "own EVM (PUSD stablecoin, 300ms blocks) whose testnet/SDK are in alpha and whose mainnet is targeted for " +
      "summer 2026. Grade the live deployed system, and state the migration in notes. Privacy mechanism: balances are " +
      "UTXO notes, each a Poseidon commitment inserted into a sparse Merkle tree (their impl is called Smirk); " +
      "spending a note inserts a deterministic nullifier N = Poseidon(nk, psi, cm) and requires a non-inclusion proof, " +
      "so double-spend is impossible. Proof system: Noir + Barretenberg (Aztec) with an on-chain UltraHonk verifier; " +
      "hash is Poseidon; private addresses are Grumpkin public keys (owner = Poseidon(x,y)); embedded curve BN254. " +
      "Proving is CLIENT-SIDE on the user's device. The proof-system NAME is era-dependent: the original Polygon-" +
      "validium circuits were Halo2 (older founder interview), while the redesigned-network docs say Noir + " +
      "Barretenberg UltraHonk — prefer the current docs but flag if the live system's circuits are unverified, and do " +
      "NOT assert an unsourced on-device proving time. Validity: " +
      "a forged transfer or double-spend is stopped by the on-chain ZK validity proof verified in the Rollup contract " +
      "plus the nullifier non-inclusion check — NOT a trusted operator for correctness. But sequencing/proving is run " +
      "by a permissioned operator set today: a single sequencer, an allowlisted prover set, and a validator set, with " +
      "multi-sequencer Fast HotStuff consensus and a PAYY token only on the roadmap (treat as future, not live). No " +
      "TEE. Upgradeability: the deployed RollupV1 contract is OwnableUpgradeable (OpenZeppelin upgradeable proxy) with " +
      "a single Owner that can add/remove provers, add/remove/swap verifiers, and manage the validator set — so " +
      "Upgradeability is Single admin (upgradeable), no multisig evidenced. Compliance: KYC only at the edges (the " +
      "Visa card and fiat on-ramps), NOT on the base private transfer; geographic OFAC-country restriction only, no " +
      "on-chain blocklist/sanctions screen; the one compliance-privacy hook is ENCRYPTED LINEAGE, a governance-gated " +
      "de-anonymisation where encrypted lineage can be decrypted in exceptional cases via an on-chain proposal — map " +
      "this to Selective disclosure, not viewing keys, proof-of-innocence, or association sets. No viewing-key scheme " +
      "exists (privacy comes from fresh-note unlinkability + nullifiers). No escape hatch / forced-exit is documented " +
      "— pick the conservative No and flag. Open source: the public repo github.com/polybase/payy is SOURCE-AVAILABLE " +
      "but NOT OSS-licensed — RollupV1.sol is SPDX UNLICENSED and the repo has no LICENSE file, so Open source = No " +
      "despite marketing calling it open source. Docs are JS-rendered: fetch the .md variant of each page (append " +
      ".md) or https://docs.payy.network/llms-full.txt for real text. Do NOT cite the 0x32...0000 / 0x30.. / 0x31.. " +
      "addresses as the host-chain rollup anchor — those are Payy-EVM predeploys. There is no L2BEAT page.",
  },
  "nightfall": {
    id: "nightfall",
    title: "Nightfall",
    description:
      "Nightfall_4 is a Rust-based zero-knowledge rollup, originally built by EY, for private transfers of ERC-20, ERC-721, ERC-1155, and ERC-3525 tokens. It hides amounts and recipients using a Zcash-style commitment and nullifier UTXO model with client-side proofs, and aggregates a batch of client proofs into one recursive validity proof so block correctness is enforced cryptographically on-chain with no challenge period. Participation is gated by on-chain X.509 enterprise certificates and an on-chain sanctions list.",
    status: "pending",
    documentation: "https://github.com/EYBlockchain/nightfall_4_CE",
    categories: ["Private L2", "Zero Knowledge Proofs (ZKPs)", "Shielded Pool"],
    sourceUrls: [
      "https://raw.githubusercontent.com/EYBlockchain/nightfall_4_CE/master/doc/nf_4.md",
      "https://raw.githubusercontent.com/EYBlockchain/nightfall_4_CE/master/doc/Upgradable%20Contracts%20Guide.md",
      "https://raw.githubusercontent.com/EYBlockchain/nightfall_4_CE/master/lib/src/derive_key.rs",
      "https://github.com/EYBlockchain/nightfall_4_CE",
      "https://github.com/EYBlockchain/nightfish_CE",
      "https://www.ey.com/en_gl/newsroom/2025/04/ey-upgrades-nightfall-a-zero-knowledge-roll-up-enabling-private-transactions-on-the-ethereum-blockchain",
      "https://plume.org/blog/nightfall-comes-to-plume-privacy-meets-scale-for-institutional-rwas",
    ],
    context:
      "CRITICAL: grade NIGHTFALL_4 (NF_4), the current canonical version — a Rust-rewritten zero-knowledge rollup by EY " +
      "(EYBlockchain). Do NOT conflate it with the older Nightfall_1 (2019 on-chain ZKP mixer, dead) or Nightfall_3 " +
      "(2021-2024, the EY + Polygon 'optimistic-ZK' hybrid with Groth16 client proofs and a fraud-proof challenge " +
      "window — superseded). The headline NF_4 change: it REMOVES the optimistic/cryptoeconomic challenge layer and " +
      "is a PURE ZK validity rollup — no challenger, no challenge period. Privacy model: Zcash-style UTXO commitments " +
      "and nullifiers (deposits create commitments, a transfer nullifies 1-2 input commitments and creates 2 outputs " +
      "plus fee commitments). Proof system: client proofs are UltraPlonk (NF_3 used Groth16) with no per-circuit " +
      "trusted setup (reuses Perpetual Powers of Tau). The recursive rollup proof is produced by EY's 'nightfish' " +
      "library (github.com/EYBlockchain/nightfish_CE, a fork of Espresso's Jellyfish PLONK adding recursion, " +
      "Zeromorph, HyperPlonk). Curve/hash: BN254 scalar field for circuit arithmetic, BabyJubJub (twisted Edwards) " +
      "for ZKP keypairs, Poseidon for commitment/nullifier/key hashing, KEM-DEM for note encryption. Proving is " +
      "CLIENT-SIDE for transfer/withdraw (the user's client generates the proof, cannot run in an HSM); EXCEPTION: " +
      "deposit proofs are generated by the proposer, not the client. Validity/verifiability: a proposer batches 64 " +
      "client transactions into an L2 block and computes ONE recursive rollup proof proving every client proof; " +
      "Nightfall.sol verifies it on-chain, and a valid proof means every transaction is correct (double-spend " +
      "blocked by the on-chain nullifier set) — so verifiability is CRYPTOGRAPHIC. Proposers are permissioned: they " +
      "must hold a valid X.509 certificate AND stake, and take turns ROUND-ROBIN with exactly one active proposer at " +
      "a time (a user may submit to multiple proposers for censorship resistance). No own consensus — finality is " +
      "inherited from the host chain. Settlement is chain-agnostic: EY frames Ethereum mainnet, but the real " +
      "deployments are host-chain privacy layers (Plume as an L3 announced Sept 2025, plus Celo and COTI) — use " +
      "Underlying chain for Time-to-finality. Compliance is the strong suit: NO deposit or withdraw without a valid " +
      "X.509 enterprise certificate (the client proves cert ownership to X509.sol, which adds the address to an " +
      "on-chain allowlist), plus an on-chain SANCTIONS contract that blocks listed addresses, and certs can be " +
      "revoked/expire — so Type of compliance includes KYC/KYB (certificate identity gating) and sanctions " +
      "screening, enforced at deposit and withdrawal, by the certificate issuer / operator. There is NO documented " +
      "viewing-key or selective-disclosure scheme for NF_4 (the key-derivation appendix is empty) — do NOT assert " +
      "viewing keys. Upgradeability: ALL core contracts (X509, X509-Allowlist, Certified, Nightfall, RoundRobin, " +
      "RollupProofVerifier) are UUPS upgradeable proxies, and _authorizeUpgrade is onlyOwner with a SINGLE owner key " +
      "(the docs state multi-sig is future) — so Upgradeability = Single admin, no timelock, no multisig. Keys: a " +
      "BIP-32/39 mnemonic derives root_key, from which nullifier_key = Poseidon(root_key, ...) and the BabyJubJub " +
      "zkp keypair are derived (the compressed zkp public key is the L2 address); separately the user holds an " +
      "Ethereum signing key (for L1 txs / cert signature) and the X.509 certificate private key. Escape hatch: NONE " +
      "— withdrawals require an active proposer to include the withdraw and post the proof, with no L1-only forced " +
      "exit (mitigation against censorship is submitting to multiple proposers, not an L1 escape). Open source: the " +
      "nightfall_4_CE repo is CC0-1.0 (public domain) → Open source = Yes (verify the nightfish_CE licence " +
      "separately). Maturity: the code was released to the public domain on 3 April 2025 and is EXPLICITLY " +
      "EXPERIMENTAL ('should not be used to make significant value transactions'), production deployment is 'TBD', " +
      "and real deployments are host-chain testnets (Plume Sept 2025) — grade it as early/testnet, not a proven " +
      "high-value mainnet, and flag. Docs: there is NO hosted docs site or sitemap — documentation lives in the " +
      "GitHub repo /doc folder (doc/nf_4.md is the primary file); the old Nightfall_3 GitBook (westlad.gitbook.io) " +
      "is superseded, do NOT cite it for NF_4. No L2BEAT page. GitHub org: github.com/EYBlockchain.",
  },
  "platus": {
    id: "platus",
    title: "Platus",
    description:
      "Platus is a composable private-account layer for Ethereum and EVM chains. Users deposit assets into a shielded pool of encrypted notes and transact through per-app stealth-address accounts, so existing dApps can recognise a returning user without learning their identity or linking activity across applications. Privacy rests on client-held viewing and spending keys with on-chain zk-SNARK verification, stealth addresses over Baby Jubjub, and hybrid post-quantum encryption.",
    status: "pending",
    documentation: "https://docs.platus.xyz/",
    categories: ["Shielded Pool", "Zero Knowledge Proofs (ZKPs)", "Stealth Addresses"],
    sourceUrls: [
      "https://docs.platus.xyz/architecture/master-account",
      "https://docs.platus.xyz/architecture/stealth-addresses",
      "https://docs.platus.xyz/architecture/cryptographic-primitives",
      "https://docs.platus.xyz/architecture/circuits",
      "https://docs.platus.xyz/architecture/keys-and-security",
      "https://docs.platus.xyz/architecture/quantum-security",
      "https://docs.platus.xyz/architecture/bundler",
      "https://docs.platus.xyz/architecture/app-account",
      "https://docs.platus.xyz/compliance",
      "https://docs.platus.xyz/guide/deposit",
      "https://www.platus.xyz/blog/introduction-to-private-accounts",
    ],
    context:
      "CRITICAL DISAMBIGUATION: this is Platus at platus.xyz / docs.platus.xyz — a composable on-chain PRIVACY " +
      "protocol (private accounts, shielded pool, stealth addresses) for EVM chains. It is NOT Platypus Finance (an " +
      "Avalanche stablecoin AMM), NOT dePlutus, NOT the Platypus CBDC academic paper — ignore all of those. " +
      "EARLY-STAGE / PRE-LAUNCH: as of the latest sources (blog through March 2026) there is NO mainnet and NO " +
      "confirmed live testnet — the 2 Dec 2025 blog says 'launching on testnet in the coming weeks', the site is " +
      "waitlist-only, and the Contract Addresses, FAQ, transact guide, and changelog doc pages all read 'Coming " +
      "Soon'. Grade it as a prototype/pre-launch system and set needsResearchReview generously where the deployed " +
      "behaviour cannot be confirmed. Architecture: an app-layer protocol on Ethereum/EVM (no own L1/L2, specific " +
      "host network NOT named in docs — do not assert one). A user holds one private master account, and per-dApp " +
      "App Accounts are deterministically derived so apps keep persistent per-user state without linking activity. " +
      "Privacy model: UTXO/note shielded pool — a note (asset, amount, owner, nonce) is committed to an on-chain " +
      "binary Merkle commitment tree, recipients hidden via stealth addresses over Baby Jubjub (sender computes " +
      "H1=[r]G, H2=[r]ik, recipient scans with viewing key). Hash Poseidon in-circuit, SHA-256/512 for key " +
      "derivation, AEAD ChaCha20-Poly1305 with HKDF-SHA256, signatures Schnorr over Baby Jubjub. POST-QUANTUM: " +
      "hybrid ECDH + ML-KEM-1024 (CRYSTALS-Kyber, NIST level 5) — so Post-quantum secure is plausibly Yes (hybrid " +
      "PQ key encapsulation), unlike most peers. Proof system: a zk-SNARK JoinSplit circuit + Merkle-membership " +
      "circuit, but the SNARK BACKEND (Groth16/PLONK), trusted setup, and CLIENT-vs-SERVER proving are NOT stated " +
      "in the docs — do NOT assert them, flag Client-side proving as unconfirmed. Validity: on-chain zk-SNARK " +
      "verification in the Master Account contract enforces note ownership, Merkle membership, nullifier " +
      "correctness, value conservation, and spending-key signature — double-spend blocked by exposed nullifiers, no " +
      "trusted operator for validity → Verifiability is CRYPTOGRAPHIC. Consensus: no own consensus — settles to a " +
      "host EVM chain via permissionless ERC-4337-style BUNDLERS that batch user operations and post proofs + notes " +
      "on-chain. Censorship resistance is EXPLICITLY NOT guaranteed today (docs say it 'can be solved with FOCIL' " +
      "and a future unified mempool) → Censorship resistance = No. Compliance: a PERMISSIONED deposit screener " +
      "evaluates each deposit's source address against OFAC SDN/sanctions lists, hack/exploit-linked addresses, and " +
      "wash/sybil patterns over a mandatory 4-hour settlement queue, signing approvals (rejected deposits are " +
      "withdrawable), plus an on-chain blacklist check on stealth addresses and tokens — so Type of compliance " +
      "includes sanctions screening / programmatic policies + an on-chain blocklist (POI/ASP), enforced at DEPOSIT, " +
      "by the permissioned screener. NO KYC/AML, and NO viewing-key-based auditor / selective-disclosure / formal " +
      "POI-set membership-proof for disclosure is documented (viewing keys exist only for the user's OWN scanning). " +
      "Keys: a client spending key sk roots the hierarchy — sPK = SHA-512(sk) x G, viewing key vk = Poseidon(sPK, " +
      "nonce), identity key ik = vk x G, an ML-KEM public key, hybrid public key hPK = (ik, mPK) shared to receive, " +
      "per-app key ak = Keccak256(sk, protocol_id) — viewing and spending are cryptographically isolated, so " +
      "Number of secrets is at least 2 independent secrets. Escape hatch: a user-callable forceExit on the Deposit " +
      "Manager lets a user withdraw a deposit before settlement if the screener rejects it or the 4-hour window " +
      "expires ('Platus never has custody') — this covers the DEPOSIT stage; a forced exit for already-shielded " +
      "notes against a censoring bundler is NOT documented, so treat Escape hatch as the deposit-stage forceExit and " +
      "flag the post-shield gap. Upgradeability/admin: NOT documented (no proxy/owner/multisig info) — pick the " +
      "conservative Single admin and set needsResearchReview. Open source: NO public GitHub, repo, licence, " +
      "whitepaper, or audit found → Open source = No (closed/not-yet-released). Maturity: pre-launch, no testnet-" +
      "live confirmation, no contract addresses → tier 1 (prototype/devnet) with a flag, NOT mainnet. Docs: " +
      "docs.platus.xyz (GitBook, has a sitemap.xml) — many pages still 'Coming Soon'. No L2BEAT page (not a " +
      "rollup). No GitHub org found.",
  },
};
