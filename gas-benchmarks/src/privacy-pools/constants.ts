import type { AbiEvent, Hex } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";

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
 * Entrypoint.deposit function:
 * https://github.com/0xbow-io/privacy-pools-core/blob/7bc392dad5fa483f53cf74e25d7ad19f0fc6d85f/packages/contracts/src/contracts/Entrypoint.sol#L111
 *
 * Emits:
 * LeafInserted() - To notify the leaf insertion in the merkle tree
 * Deposited() - Emitted inside PrivacyPool.sol contract (internal)
 * Deposited() - Emitted inside Entrypoint.sol contract (external)
 *
 * Example:
 * https://etherscan.io/tx/0x87320aaae4868c6f5b7c8b31ba2fc82005bdd7522fdf85f9eb8dcc93a34cb475
 */
export const SHIELD_ETH_EVENTS = [
  {
    type: "event",
    name: "LeafInserted",
    inputs: [
      { name: "_index", type: "uint256", indexed: false },
      { name: "_leaf", type: "uint256", indexed: false },
      { name: "_root", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { name: "_depositor", type: "address", indexed: true },
      { name: "_commitment", type: "uint256", indexed: false },
      { name: "_label", type: "uint256", indexed: false },
      { name: "_value", type: "uint256", indexed: false },
      { name: "_precommitmentHash", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { name: "depositor", type: "address", indexed: true },
      { name: "pool", type: "address", indexed: true },
      { name: "commitment", type: "uint256", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const satisfies readonly AbiEvent[];

/**
 * Entrypoint.relay function:
 * https://github.com/0xbow-io/privacy-pools-core/blob/7bc392dad5fa483f53cf74e25d7ad19f0fc6d85f/packages/contracts/src/contracts/Entrypoint.sol#L133
 *
 * Emits:
 * LeafInserted() - Emitted inside State.sol -> insert()
 * Withdrawn() - Emitted inside PrivacyPool.sol -> withdraw()
 * WithdrawalRelayed() - Emitted inside Entrypoint.relay()
 *
 * Example:
 * https://etherscan.io/tx/0x47e918eda32bc332a5684aa986733eb4fde7a4f8189e21443f23adf0807974b7
 */
export const UNSHIELD_ETH_EVENTS = [
  {
    type: "event",
    name: "LeafInserted",
    inputs: [
      { name: "_index", type: "uint256", indexed: false },
      { name: "_leaf", type: "uint256", indexed: false },
      { name: "_root", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { name: "processor", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
      { name: "spentNullifier", type: "uint256", indexed: false },
      { name: "newCommitment", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WithdrawalRelayed",
    inputs: [
      { name: "relayer", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "asset", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "feeAmount", type: "uint256", indexed: false },
    ],
  },
] as const satisfies readonly AbiEvent[];
