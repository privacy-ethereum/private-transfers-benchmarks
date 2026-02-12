import type { AbiEvent, Hex } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";

/**
 * Maximum number of logs with a Shield event to be searched.
 * Depends on the ratio of how many AA txs - EOA txs
 */
export const MAX_OF_LOGS = NUMBER_OF_TRANSACTIONS * 5;

/**
 * Tornado Cash Router contract that directs deposits to different pools (ETH, ERC20 0.1, ERC20 1, ERC20 10, ERC20 100):
 * https://github.com/tornadocash/tornado-anonymity-mining/blob/d93d7c8870fc3cd4cb1da698301e737e1606ba9c/contracts/TornadoProxy.sol
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

/**
 * A deposit function call emits:
 * Deposit() - To notify the token public deposit into the contract
 * EncryptedNote() - To notify the encrypted note generation
 */
export const NUMBER_OF_SHIELD_EVENTS = 2;
