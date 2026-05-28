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
};
