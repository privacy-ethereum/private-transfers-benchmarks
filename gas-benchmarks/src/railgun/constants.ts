import { parseAbiItem, type Address } from "viem";

import type { ProtocolConfig } from "../utils/types.js";

/**
 * Proxy contract that points to the RailgunSmartWallet contract.
 *
 * NOTE: Railgun does not support native ETH, only ERC20 tokens.
 * Reference: https://docs.railgun.org/developer-guide/wallet/transactions/shielding/shield-base-token
 */
const RAILGUN_SMART_WALLET_PROXY: Address = "0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9";

/**
 * RailgunSmartWallet.shield function.
 *
 * Emits:
 * Transfer() - Tokens sent to shielded pool
 * Transfer() - Shield fee sent to vault
 * Shield() - To notify the shield
 */
const SHIELD_ERC20_EVENTS = [
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem(
    "event Shield(uint256 treeNumber, uint256 startPosition, (bytes32 npk, (uint8 tokenType, address tokenAddress, uint256 tokenSubID) token, uint120 value)[] commitments, (bytes32[3] encryptedBundle, bytes32 shieldKey)[] shieldCiphertext, uint256[] fees)",
  ),
] as const;

/**
 * RailgunSmartWallet.transact function (contains unshield logic for specific internal transactions).
 *
 * Emits:
 * Nullified() - Nullifier being spent emitted in RailgunLogic.accumulateAndNullifyTransaction
 * Transfer() - Transfer unshielded tokens to recipient emitted in RailgunLogic.transferTokenOut
 * Transfer() - Transfer unshield fee to vault emitted in RailgunLogic.transferTokenOut
 * Unshield() - To notify the unshield process emitted in RailgunLogic.transferTokenOut
 */
const UNSHIELD_ERC20_EVENTS = [
  parseAbiItem("event Nullified(uint16 treeNumber, bytes32[] nullifier)"),
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem(
    "event Unshield(address to, (uint8 tokenType, address tokenAddress, uint256 tokenSubID) token, uint256 amount, uint256 fee)",
  ),
] as const;

/**
 * RailgunSmartWallet.transact (private transfer) function.
 *
 * Emits:
 * Nullified() - Nullifier being spent emitted in RailgunLogic.accumulateAndNullifyTransaction
 * Transact() - To notify the commitment state update emitted in RailgunSmartWallet.transact
 */
const TRANSFER_ERC20_EVENTS = [
  parseAbiItem("event Nullified(uint16 treeNumber, bytes32[] nullifier)"),
  parseAbiItem(
    "event Transact(uint256 treeNumber, uint256 startPosition, bytes32[] hash, (bytes32[4] ciphertext, bytes32 blindedSenderViewingKey, bytes32 blindedReceiverViewingKey, bytes annotationData, bytes memo)[] ciphertext)",
  ),
] as const;

/** Railgun configuration */
const RAILGUN_CONFIG = {
  name: "railgun",
  version: "0.0.1",
  contracts: [
    {
      address: RAILGUN_SMART_WALLET_PROXY,
      sourceUrl: "https://github.com/Railgun-Privacy/contract/blob/main/contracts/logic/RailgunSmartWallet.sol",
    },
  ],
  operations: [
    {
      functionSourceUrl:
        "https://github.com/Railgun-Privacy/contract/blob/9ec09123eb140fdaaf3a5ff1f29d634c353630cd/contracts/logic/RailgunSmartWallet.sol#L21",
      exampleTxUrl: "https://etherscan.io/tx/0x5c9bb21f9aa22f636e468bfb19b17093ccc5de7d86aad601b5b4b607f07f1143",
      events: SHIELD_ERC20_EVENTS,
    },
    {
      functionSourceUrl:
        "https://github.com/Railgun-Privacy/contract/blob/9ec09123eb140fdaaf3a5ff1f29d634c353630cd/contracts/logic/RailgunSmartWallet.sol#L68",
      exampleTxUrl: "https://etherscan.io/tx/0x2c3e8738f9d0d3e98b702a6dc375162fe21777e35f19d8b662088b2b6987e722",
      events: UNSHIELD_ERC20_EVENTS,
    },
    {
      functionSourceUrl:
        "https://github.com/Railgun-Privacy/contract/blob/9ec09123eb140fdaaf3a5ff1f29d634c353630cd/contracts/logic/RailgunSmartWallet.sol#L68",
      exampleTxUrl: "https://etherscan.io/tx/0xb010a8f2babfa78bb6945221817238c58234d06eb56177de6e002e761574fc53",
      events: TRANSFER_ERC20_EVENTS,
    },
  ],
} satisfies ProtocolConfig;

export {
  RAILGUN_SMART_WALLET_PROXY,
  SHIELD_ERC20_EVENTS,
  UNSHIELD_ERC20_EVENTS,
  TRANSFER_ERC20_EVENTS,
  RAILGUN_CONFIG,
};
