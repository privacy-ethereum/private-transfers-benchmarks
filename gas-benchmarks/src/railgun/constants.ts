import type { AbiEvent, Hex } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";
import type { TopicFilterConfig } from "../utils/types.js";

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

// keccak256 of Shield(uint256,uint256,(bytes32,(uint8,address,uint256),uint120)[],((bytes32[3]),bytes32)[],uint256[])
const SHIELD_TOPIC: Hex = "0xd38e38773a674d12ff2feb5af5bffe1b6b67e428c0dcb57e2ba2e94b7d809694";

/**
 * Event ABI for the Unshield event emitted by RailgunLogic in function transferTokenOut
 */
export const UNSHIELD_EVENT_ABI = {
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
} as const satisfies AbiEvent;

// keccak256 of Unshield(address,(uint8,address,uint256),uint256,uint256)
const UNSHIELD_TOPIC: Hex = "0xd93cf895c7d5b2cd7dc7a098b678b3089f37d91f48d9b83a0800a91cbdf05284";

/**
 * Event ABI for the Nullified event emitted by RailgunLogic in function accumulateAndNullifyTransaction
 */
export const NULLIFIED_EVENT_ABI = {
  type: "event",
  name: "Nullified",
  inputs: [
    { name: "treeNumber", type: "uint16", indexed: false },
    { name: "nullifier", type: "bytes32[]", indexed: false },
  ],
} as const satisfies AbiEvent;

// keccak256 of Nullified(uint16,bytes32[])
const NULLIFIED_TOPIC: Hex = "0x781745c57906dc2f175fec80a9c691744c91c48a34a83672c41c2604774eb11f";

/**
 * Shield flow: requires Shield event, forbids Unshield and Nullified events.
 * A pure shield tx only emits Transfer + Shield (no nullifier spend).
 */
export const SHIELD_TOPIC_FILTER: TopicFilterConfig = {
  required: [{ contractAddress: RAILGUN_SMART_WALLET_PROXY, topic: SHIELD_TOPIC }],
  forbidden: [
    { contractAddress: RAILGUN_SMART_WALLET_PROXY, topic: UNSHIELD_TOPIC },
    { contractAddress: RAILGUN_SMART_WALLET_PROXY, topic: NULLIFIED_TOPIC },
  ],
};

/**
 * Unshield flow: requires Nullified + Unshield events, forbids Shield event.
 * An unshield tx spends a nullifier and emits an Unshield event.
 */
export const UNSHIELD_TOPIC_FILTER: TopicFilterConfig = {
  required: [
    { contractAddress: RAILGUN_SMART_WALLET_PROXY, topic: NULLIFIED_TOPIC },
    { contractAddress: RAILGUN_SMART_WALLET_PROXY, topic: UNSHIELD_TOPIC },
  ],
  forbidden: [{ contractAddress: RAILGUN_SMART_WALLET_PROXY, topic: SHIELD_TOPIC }],
};

/**
 * Transfer (private) flow: requires Nullified event, forbids Unshield and Shield events.
 * A private transfer only spends a nullifier without shielding or unshielding.
 */
export const TRANSFER_TOPIC_FILTER: TopicFilterConfig = {
  required: [{ contractAddress: RAILGUN_SMART_WALLET_PROXY, topic: NULLIFIED_TOPIC }],
  forbidden: [
    { contractAddress: RAILGUN_SMART_WALLET_PROXY, topic: UNSHIELD_TOPIC },
    { contractAddress: RAILGUN_SMART_WALLET_PROXY, topic: SHIELD_TOPIC },
  ],
};
