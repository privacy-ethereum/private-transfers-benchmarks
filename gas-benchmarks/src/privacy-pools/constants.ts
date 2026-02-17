import type { AbiEvent, Hex } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";
import type { TopicFilterConfig } from "../utils/types.js";

/**
 * Maximum number of logs with a Deposited event to be searched.
 * Depends on the ratio of how many AA txs - EOA txs
 */
export const MAX_OF_LOGS = NUMBER_OF_TRANSACTIONS * 5;

/**
 * Proxy contract address for the Privacy Pools Entrypoint:
 * https://github.com/0xbow-io/privacy-pools-core/blob/main/packages/contracts/src/contracts/Entrypoint.sol
 */
export const PRIVACY_POOLS_ENTRYPOINT_PROXY: Hex = "0x6818809EefCe719E480a7526D76bD3e561526b46";

/**
 * Event ABI for the Deposited event emitted by deposit -> _handleDeposit() function
 */
export const DEPOSITED_EVENT_ABI = {
  type: "event",
  name: "Deposited",
  inputs: [
    { name: "depositor", type: "address", indexed: true },
    { name: "pool", type: "address", indexed: true },
    { name: "commitment", type: "uint256", indexed: false },
    { name: "amount", type: "uint256", indexed: false },
  ],
} as const satisfies AbiEvent;

// keccak256 of Deposited(address,address,uint256,uint256)
const DEPOSITED_TOPIC: Hex = "0xf5681f9d0db1b911ac18ee83d515a1cf1051853a9eae418316a2fdf7dea427c5";

/**
 * Event ABI for the WithdrawalRelayed event emitted by Entrypoint.relay()
 */
export const WITHDRAWAL_RELAYED_EVENT_ABI = {
  type: "event",
  name: "WithdrawalRelayed",
  inputs: [
    { name: "_relayer", type: "address", indexed: true },
    { name: "_recipient", type: "address", indexed: true },
    { name: "_asset", type: "address", indexed: true },
    { name: "_amount", type: "uint256", indexed: false },
    { name: "_feeAmount", type: "uint256", indexed: false },
  ],
} as const satisfies AbiEvent;

// keccak256 of WithdrawalRelayed(address,address,address,uint256,uint256)
const WITHDRAWAL_RELAYED_TOPIC: Hex = "0xe9b67844a7bb6e6ac95e8a0de02e4448dbb0c9460be9194348e4bbac6d13c2cf";

/**
 * Shield flow: requires Deposited from Entrypoint, forbids WithdrawalRelayed.
 * A deposit tx emits Deposited but never WithdrawalRelayed.
 */
export const SHIELD_TOPIC_FILTER: TopicFilterConfig = {
  required: [{ contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY, topic: DEPOSITED_TOPIC }],
  forbidden: [{ contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY, topic: WITHDRAWAL_RELAYED_TOPIC }],
};

/**
 * Unshield flow: requires WithdrawalRelayed from Entrypoint, forbids Deposited.
 * A relay/withdrawal tx emits WithdrawalRelayed but never Deposited.
 */
export const UNSHIELD_TOPIC_FILTER: TopicFilterConfig = {
  required: [{ contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY, topic: WITHDRAWAL_RELAYED_TOPIC }],
  forbidden: [{ contractAddress: PRIVACY_POOLS_ENTRYPOINT_PROXY, topic: DEPOSITED_TOPIC }],
};
