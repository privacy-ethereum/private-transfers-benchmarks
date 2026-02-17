import type { AbiEvent, Hex } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";

/**
 * Maximum number of logs with a Deposited event to be searched.
 * Depends on the ratio of how many AA txs - EOA txs
 */
export const MAX_OF_LOGS = NUMBER_OF_TRANSACTIONS * 5;

/**
 * INTMAX Liquidity contract on Ethereum that handles deposits and withdrawals:
 * https://docs.network.intmax.io/developers-hub/intmax-nodes/smart-contracts
 */
export const INTMAX_LIQUIDITY: Hex = "0xF65e73aAc9182e353600a916a6c7681F810f79C3";

/**
 * Event ABI for the Deposited event emitted by the Liquidity contract _deposit() function:
 * https://github.com/InternetMaximalism/intmax2-contract/blob/main/contracts/liquidity/ILiquidity.sol
 */
export const DEPOSITED_EVENT_ABI = {
  type: "event",
  name: "Deposited",
  inputs: [
    { name: "depositId", type: "uint256", indexed: true },
    { name: "sender", type: "address", indexed: true },
    { name: "recipientSaltHash", type: "bytes32", indexed: true },
    { name: "tokenIndex", type: "uint32", indexed: false },
    { name: "amount", type: "uint256", indexed: false },
    { name: "isEligible", type: "bool", indexed: false },
    { name: "depositedAt", type: "uint256", indexed: false },
  ],
} as const satisfies AbiEvent;

/**
 * A depositNativeToken function call emits:
 * Deposited() - To notify the deposit to the INTMAX network (emitted by the Liquidity contract)
 *
 * Example:
 * https://etherscan.io/address/0xF65e73aAc9182e353600a916a6c7681F810f79C3
 */
export const NUMBER_OF_SHIELD_EVENTS = 1;

/**
 * Event ABI for the DirectWithdrawalSuccessed event emitted by Liquidity._processDirectWithdrawal():
 * https://github.com/InternetMaximalism/intmax2-contract/blob/main/contracts/liquidity/ILiquidity.sol
 */
export const DIRECT_WITHDRAWAL_SUCCESSED_EVENT_ABI = {
  type: "event",
  name: "DirectWithdrawalSuccessed",
  inputs: [
    { name: "withdrawalHash", type: "bytes32", indexed: true },
    { name: "recipient", type: "address", indexed: true },
  ],
} as const satisfies AbiEvent;

/**
 * A processWithdrawals function call (single direct native ETH withdrawal with fee) emits:
 * DirectWithdrawalSuccessed() - To notify the successful direct withdrawal (emitted by the Liquidity contract)
 * WithdrawalFeeCollected() - To notify the fee collection (emitted by the Liquidity contract)
 *
 * Note: processWithdrawals is called by the withdrawal aggregator and typically batches
 * multiple withdrawals per transaction. This event count targets the minimal case of
 * a single direct withdrawal with fee. It may need adjustment based on observed on-chain data.
 */
export const NUMBER_OF_UNSHIELD_EVENTS = 2;
