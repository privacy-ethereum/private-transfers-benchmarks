import type { AbiEvent, Hex } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";

/**
 * Maximum number of logs with a Shield event to be searched.
 * Depends on the ratio of how many AA txs - EOA txs
 */
export const MAX_OF_LOGS = NUMBER_OF_TRANSACTIONS * 10;

/**
 * Proxy contract that points to the RailgunSmartWallet contract:
 * https://github.com/Railgun-Privacy/contract/blob/main/contracts/logic/RailgunSmartWallet.sol
 *
 * NOTE: Railgun does not support native ETH, only ERC20 tokens.
 * Reference: https://docs.railgun.org/developer-guide/wallet/transactions/shielding/shield-base-token
 */
export const RAILGUN_SMART_WALLET_PROXY: Hex = "0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9";

/**
 * RailgunSmartWallet.shield function:
 * https://github.com/Railgun-Privacy/contract/blob/9ec09123eb140fdaaf3a5ff1f29d634c353630cd/contracts/logic/RailgunSmartWallet.sol#L21
 *
 * Emits:
 * Transfer() - Tokens sent to shielded pool
 * Transfer() - Shield fee sent to vault
 * Shield() - To notify the shield
 *
 * Example:
 * https://etherscan.io/tx/0x5c9bb21f9aa22f636e468bfb19b17093ccc5de7d86aad601b5b4b607f07f1143
 */
export const SHIELD_ERC20_EVENTS = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Shield",
    inputs: [
      { name: "treeNumber", type: "uint256", indexed: false },
      { name: "startPosition", type: "uint256", indexed: false },
      {
        name: "commitments",
        type: "tuple[]",
        indexed: false,
        components: [
          { name: "npk", type: "bytes32" },
          {
            name: "token",
            type: "tuple",
            components: [
              { name: "tokenType", type: "uint8" },
              { name: "tokenAddress", type: "address" },
              { name: "tokenSubID", type: "uint256" },
            ],
          },
          { name: "value", type: "uint120" },
        ],
      },
      {
        name: "shieldCiphertext",
        type: "tuple[]",
        indexed: false,
        components: [
          { name: "encryptedBundle", type: "bytes32[3]" },
          { name: "shieldKey", type: "bytes32" },
        ],
      },
      { name: "fees", type: "uint256[]", indexed: false },
    ],
  },
] as const satisfies readonly AbiEvent[];

/**
 * RailgunSmartWallet.transact function (contains unshield logic for specific internal transactions):
 * https://github.com/Railgun-Privacy/contract/blob/9ec09123eb140fdaaf3a5ff1f29d634c353630cd/contracts/logic/RailgunSmartWallet.sol#L68
 *
 * Emits:
 * Nullified() - Nullifier being spent emitted in RailgunLogic.accumulateAndNullifyTransaction
 * Transfer() - Transfer unshielded tokens to recipient emitted in RailgunLogic.transferTokenOut
 * Transfer() - Transfer unshield fee to vault emitted in RailgunLogic.transferTokenOut
 * Unshield() - To notify the unshield process emitted in RailgunLogic.transferTokenOut
 *
 * Example:
 * https://etherscan.io/tx/0x2c3e8738f9d0d3e98b702a6dc375162fe21777e35f19d8b662088b2b6987e722
 */
export const UNSHIELD_ERC20_EVENTS = [
  {
    type: "event",
    name: "Nullified",
    inputs: [
      { name: "treeNumber", type: "uint16", indexed: false },
      { name: "nullifier", type: "bytes32[]", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Unshield",
    inputs: [
      { name: "to", type: "address", indexed: false },
      {
        name: "token",
        type: "tuple",
        indexed: false,
        components: [
          { name: "tokenType", type: "uint8" },
          { name: "tokenAddress", type: "address" },
          { name: "tokenSubID", type: "uint256" },
        ],
      },
      { name: "amount", type: "uint256", indexed: false },
      { name: "fee", type: "uint256", indexed: false },
    ],
  },
] as const satisfies readonly AbiEvent[];

/**
 * RailgunSmartWallet.transact (private transfer) function:
 * https://github.com/Railgun-Privacy/contract/blob/9ec09123eb140fdaaf3a5ff1f29d634c353630cd/contracts/logic/RailgunSmartWallet.sol#L68
 *
 * Emits:
 * Nullified() - Nullifier being spent emitted in RailgunLogic.accumulateAndNullifyTransaction
 * Transact() - To notify the commitment state update emitted in RailgunSmartWallet.transact
 *
 * Example:
 * https://etherscan.io/tx/0xb010a8f2babfa78bb6945221817238c58234d06eb56177de6e002e761574fc53
 */
export const TRANSFER_ERC20_EVENTS = [
  {
    type: "event",
    name: "Nullified",
    inputs: [
      { name: "treeNumber", type: "uint16", indexed: false },
      { name: "nullifier", type: "bytes32[]", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Transact",
    inputs: [
      { name: "treeNumber", type: "uint256", indexed: false },
      { name: "startPosition", type: "uint256", indexed: false },
      { name: "hash", type: "bytes32[]", indexed: false },
      {
        name: "ciphertext",
        type: "tuple[]",
        indexed: false,
        components: [
          { name: "ciphertext", type: "bytes32[4]" },
          { name: "blindedSenderViewingKey", type: "bytes32" },
          { name: "blindedReceiverViewingKey", type: "bytes32" },
          { name: "annotationData", type: "bytes" },
          { name: "memo", type: "bytes" },
        ],
      },
    ],
  },
] as const satisfies readonly AbiEvent[];
