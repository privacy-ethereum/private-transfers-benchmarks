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

/**
 * A deposit function call emits:
 * LeafInserted() - To notify the leaf insertion in the merkle tree
 * Deposited() - Emitted inside PrivacyPool.sol contract (internal)
 * Deposited() - Emitted inside Entrypoint.sol contract (external)
 */
export const NUMBER_OF_SHIELD_EVENTS = 3;

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

/**
 * A relay (unshield) function call emits:
 * Withdrawn() - Emitted inside PrivacyPool.withdraw()
 * Transfer() - Net amount to recipient
 * Transfer() - Fee to fee recipient
 * WithdrawalRelayed() - Emitted inside Entrypoint.relay()
 */
export const NUMBER_OF_UNSHIELD_EVENTS = 4;
