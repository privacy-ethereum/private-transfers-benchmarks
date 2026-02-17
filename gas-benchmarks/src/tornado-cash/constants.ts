import type { AbiEvent, Hex } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";
import type { TopicFilterConfig } from "../utils/types.js";

/**
 * Maximum number of logs with a Shield event to be searched.
 * Depends on the ratio of how many AA txs - EOA txs
 */
export const MAX_OF_LOGS = NUMBER_OF_TRANSACTIONS * 5;

/**
 * Tornado Cash Router contract that directs deposits to different pools (ETH, ERC20 0.1, ERC20 1, ERC20 10, ERC20 100):
 * https://github.com/contractscan/etherscan.io-0xd90e2f925da726b50c4ed8d0fb90ad053324f31b/blob/main/TornadoRouter.sol
 */
export const TORNADO_CASH_ROUTER: Hex = "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b";

/**
 * Event ABI for the EncryptedNote event emitted by Tornado.Cash Proxy contract
 */
export const ENCRYPTED_NOTE_EVENT_ABI = {
  type: "event",
  name: "EncryptedNote",
  inputs: [
    { name: "sender", type: "address", indexed: true },
    { name: "encryptedNote", type: "bytes", indexed: false },
  ],
} as const satisfies AbiEvent;

// keccak256 of EncryptedNote(address,bytes)
const ENCRYPTED_NOTE_TOPIC: Hex = "0xfa28df43db3553771f7209dcef046f3bdfea15870ab625dcda30ac58b82b4008";

/**
 * Tornado Cash Relayer Registry contract that emits a StakeBurned event when a relayed withdrawal is executed.
 * After it, a pool (ETH, ERC20 0.1, ERC20 1, ERC20 10, ERC20 100) emits a Withdrawal event.
 * https://github.com/contractscan/etherscan.io-0xd90e2f925da726b50c4ed8d0fb90ad053324f31b/blob/main/RelayerRegistry.sol
 */
export const TORNADO_CASH_RELAYER_REGISTRY: Hex = "0x58E8dCC13BE9780fC42E8723D8EaD4CF46943dF2";

/**
 * Event ABI for the StakeBurned event emitted by registry during withdraw
 */
export const STAKE_BURNED_EVENT_ABI = {
  type: "event",
  name: "StakeBurned",
  inputs: [
    { name: "relayer", type: "address", indexed: false },
    { name: "amountBurned", type: "uint256", indexed: false },
  ],
} as const satisfies AbiEvent;

// keccak256 of StakeBurned(address,uint256)
const STAKE_BURNED_TOPIC: Hex = "0x659f33fc6677bebf3a9bf3101092792e31f35766d0358e54577bdd91a655f6a0";

/**
 * Shield flow: requires EncryptedNote from Router, forbids StakeBurned from RelayerRegistry.
 * A deposit tx emits EncryptedNote but never StakeBurned (that only happens on withdrawal).
 */
export const SHIELD_TOPIC_FILTER: TopicFilterConfig = {
  required: [{ contractAddress: TORNADO_CASH_ROUTER, topic: ENCRYPTED_NOTE_TOPIC }],
  forbidden: [{ contractAddress: TORNADO_CASH_RELAYER_REGISTRY, topic: STAKE_BURNED_TOPIC }],
};

/**
 * Unshield flow: requires StakeBurned from RelayerRegistry, forbids EncryptedNote from Router.
 * A withdrawal tx emits StakeBurned but never EncryptedNote (that only happens on deposit).
 */
export const UNSHIELD_TOPIC_FILTER: TopicFilterConfig = {
  required: [{ contractAddress: TORNADO_CASH_RELAYER_REGISTRY, topic: STAKE_BURNED_TOPIC }],
  forbidden: [{ contractAddress: TORNADO_CASH_ROUTER, topic: ENCRYPTED_NOTE_TOPIC }],
};
