import { parseAbiItem, type Address } from "viem";

import type { ProtocolConfig } from "../utils/types.js";

/**
 * Hinkal Pool contract deployed at the same address across all supported chains
 * (Ethereum, Arbitrum, Optimism, Polygon, Base):
 */
const HINKAL_POOL: Address = "0x25e5e82f5702A27C3466fE68f14abDbbAdFca826";

/**
 * Hinkal.transact function - shield native ETH into the Hinkal pool. It does not emit outputs (nullified)
 *
 * Emits:
 * NewCommitment() - New private commitment inserted into the Merkle tree (emitted by HinkalBase.insertCommitments). A deposit has 1 commitment and 0 nullified events
 *
 * Note: deposits can be done with .transact() and also with .prooflessDeposit() function execution
 */
const SHIELD_ETH_EVENTS = [
  parseAbiItem("event NewCommitment(uint256 commitment, int256 index, bytes encryptedOutput)"),
] as const;

/**
 * Hinkal.transact function (unshield) - withdraw native ETH from the Hinkal pool. It does not outputs new notes (commitments)
 *
 * Emits:
 * Nullified() - Input commitment nullifier marked as spent (emitted by HinkalBase.insertNullifiers)
 */
const UNSHIELD_ETH_EVENTS = [parseAbiItem("event Nullified(uint256 nullifier)")] as const;

/**
 * Hinkal.transact function (private transfer) - move native ETH privately within the Hinkal pool. One input nullified, one output commitment
 *
 * Emits:
 * Nullified() - Input commitment nullifier marked as spent (emitted by HinkalBase.insertNullifiers)
 * NewCommitment() - Recipient commitment inserted into Merkle tree (emitted by HinkalBase.insertCommitments)
 */
const INTERNAL_TRANSFER_EVENTS = [
  parseAbiItem("event Nullified(uint256 nullifier)"),
  parseAbiItem("event NewCommitment(uint256 commitment, int256 index, bytes encryptedOutput)"),
] as const;

/**
 * Hinkal.transact function - shield ERC20 tokens into the Hinkal pool. It does not emit outputs (nullified):
 *
 * Emits:
 * Transfer() - ERC20 token transfer from depositor to Hinkal pool (emitted by the ERC20 token contract)
 * NewCommitment() - New private commitment inserted into the Merkle tree (emitted by HinkalBase.insertCommitments). A deposit has 1 commitment and 0 nullified events
 *
 * Note: deposits can be done with .transact() and also with .prooflessDeposit() function execution
 */
const SHIELD_ERC20_EVENTS = [
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event NewCommitment(uint256 commitment, int256 index, bytes encryptedOutput)"),
] as const;

/**
 * Hinkal.transact function (unshield) - withdraw ERC20 tokens from the Hinkal pool:
 *
 * Emits:
 * Transfer() - ERC20 token transfer from Hinkal pool to recipient (emitted by the ERC20 token contract)
 * Transfer() - ERC20 token transfer from Hinkal pool to relayer (emitted by the ERC20 token contract, only for unshielding with relayer fee)
 * Nullified() - Input commitment nullifier marked as spent (emitted by HinkalBase.insertNullifiers)
 */
const UNSHIELD_ERC20_EVENTS = [
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event Nullified(uint256 nullifier)"),
] as const;

/**
 * Hinkal configuration
 * The repository has been closed source since March 31th 2026
 *
 * */
const HINKAL_CONFIG = {
  name: "hinkal",
  version: "1.0.0",
  contracts: [
    {
      address: HINKAL_POOL,
      sourceUrl: "https://github.com/Hinkal-Protocol/Hinkal-Smart-Contracts/blob/main/contracts/Hinkal.sol",
    },
  ],
  operations: [
    {
      functionSourceUrl:
        "https://github.com/Hinkal-Protocol/Hinkal-Smart-Contracts/blob/8bd371883a0d8f6f56775228ee48a1bbf9fecbac/contracts/Hinkal.sol#L40",
      exampleTxUrl: "https://etherscan.io/tx/0x90fe99c5df0f36ace8a2ab3ff2b03e147413374eb28737619d41f2b920c15112",
      events: SHIELD_ETH_EVENTS,
    },
    {
      functionSourceUrl:
        "https://github.com/Hinkal-Protocol/Hinkal-Smart-Contracts/blob/8bd371883a0d8f6f56775228ee48a1bbf9fecbac/contracts/Hinkal.sol#L40",
      exampleTxUrl: "https://etherscan.io/tx/0xf338c2349630c21d0bf25a9e10170c12be4c00db060163802573410056dd6516",
      events: UNSHIELD_ETH_EVENTS,
    },
    {
      functionSourceUrl:
        "https://github.com/Hinkal-Protocol/Hinkal-Smart-Contracts/blob/8bd371883a0d8f6f56775228ee48a1bbf9fecbac/contracts/Hinkal.sol#L40",
      exampleTxUrl: "https://etherscan.io/tx/0x299802df8a9a660c3afc3c2f965dd9a1c0031ce5b5cba9b6d26c47c626d1c2f5",
      events: INTERNAL_TRANSFER_EVENTS,
    },
    {
      functionSourceUrl:
        "https://github.com/Hinkal-Protocol/Hinkal-Smart-Contracts/blob/8bd371883a0d8f6f56775228ee48a1bbf9fecbac/contracts/Hinkal.sol#L40",
      exampleTxUrl: "https://etherscan.io/tx/0x62a0f3761294bc57d08774f847e53c33fe32447f8822180f3a49497257f78232",
      events: SHIELD_ERC20_EVENTS,
    },
    {
      functionSourceUrl:
        "https://github.com/Hinkal-Protocol/Hinkal-Smart-Contracts/blob/8bd371883a0d8f6f56775228ee48a1bbf9fecbac/contracts/Hinkal.sol#L40",
      exampleTxUrl: "https://etherscan.io/tx/0xe3b209b9be9bcd1d0bf6a80ffeb612cdcb0a721f38c9a518c970e57e388295c4",
      events: UNSHIELD_ERC20_EVENTS,
    },
  ],
} satisfies ProtocolConfig;

export {
  HINKAL_POOL,
  SHIELD_ETH_EVENTS,
  UNSHIELD_ETH_EVENTS,
  INTERNAL_TRANSFER_EVENTS,
  SHIELD_ERC20_EVENTS,
  UNSHIELD_ERC20_EVENTS,
  HINKAL_CONFIG,
};
