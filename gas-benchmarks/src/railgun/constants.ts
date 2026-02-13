import type { AbiEvent, Hex } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";

/**
 * Maximum number of logs with a Shield event to be searched.
 * Depends on the ratio of how many AA txs - EOA txs
 */
export const MAX_OF_LOGS = NUMBER_OF_TRANSACTIONS * 5;

/**
 * Proxy contract that points to the RailgunSmartWallet contract:
 * https://github.com/Railgun-Privacy/contract/blob/main/contracts/logic/RailgunSmartWallet.sol
 */
export const RAILGUN_SMART_WALLET_PROXY: Hex = "0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9";

/**
 * Event ABI for the Shield event emitted by RailgunSmartWallet
 */
export const SHIELD_EVENT_ABI = {
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
} as const satisfies AbiEvent;

/**
 * A shield function call emits:
 * Transfer() - Tokens sent to shielded pool
 * Transfer() - Shield fee sent to vault
 * Shield() - To notify the shield
 */
export const NUMBER_OF_SHIELD_EVENTS = 3;
