import type { AbiEvent, Hex } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";

/**
 * Maximum number of logs with a Deposited event to be searched.
 * Depends on the ratio of how many AA txs - EOA txs
 */
export const MAX_OF_LOGS = NUMBER_OF_TRANSACTIONS * 50;

/**
 * INTMAX Liquidity contract on Ethereum mainnet that handles ETH native deposits and withdrawals:
 * https://github.com/InternetMaximalism/intmax2-contract/blob/main/contracts/liquidity/Liquidity.sol
 */
export const INTMAX_LIQUIDITY_PROXY: Hex = "0xF65e73aAc9182e353600a916a6c7681F810f79C3";

/**
 * Liquidity.depositNativeToken function:
 * https://github.com/InternetMaximalism/intmax2-contract/blob/83b00c76049a75ac5186661ee7ecb10d0ce6ec25/contracts/liquidity/Liquidity.sol#L269
 *
 * Emits:
 * TaskValidated() - To notify AML permission (emitted by one of Predicate contracts.
 * TaskValidated (index_topic_1 address msgSender, index_topic_2 address target, index_topic_3 uint256 value, string policyID, string taskId, uint256 quorumThresholdCount, uint256 expireByTime, address[] signerAddresses)
 * I couldn't find the specific event in the codebase. Intmax uses this package https://www.npmjs.com/package/@predicate/contracts)
 * Deposited() - To notify the deposit to the INTMAX network (emitted by the Liquidity contract)
 *
 * Example:
 * https://etherscan.io/tx/0x6de98a249147cb1b384add0a9e1770094728fffbe811f9909ba0c59c528e4d37
 *
 * NOTE: Intmax paused deposits and withdrawals due to a ZK bug on Feb 7th, 2026. There are a lot of reverted txs since then
 * Reference: https://x.com/intmaxIO/status/2020114765171855805
 */
export const SHIELD_ETH_EVENTS = [
  {
    type: "event",
    name: "TaskValidated",
    inputs: [
      { name: "msgSender", type: "address", indexed: true },
      { name: "target", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: true },
      { name: "policyID", type: "string", indexed: false },
      { name: "taskId", type: "string", indexed: false },
      { name: "quorumThresholdCount", type: "uint256", indexed: false },
      { name: "expireByTime", type: "uint256", indexed: false },
      { name: "signerAddresses", type: "address[]", indexed: false },
    ],
  },
  {
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
  },
] as const satisfies readonly AbiEvent[];

/**
 * TODO: is is not the withdrawal contract. Please review it again
 *
 * Liquidity.processWithdrawals function (single direct native ETH withdrawal with fee):
 * https://github.com/InternetMaximalism/intmax2-contract/blob/83b00c76049a75ac5186661ee7ecb10d0ce6ec25/contracts/liquidity/Liquidity.sol#L570
 *
 * Emits:
 * DirectWithdrawalSuccessed() - To notify the successful direct withdrawal (emitted by the Liquidity contract)
 * WithdrawalFeeCollected() - To notify the fee collection (emitted by the Liquidity contract)
 *
 * Note: processWithdrawals is called by the withdrawal aggregator and typically batches withdrawals txs.
 */
export const UNSHIELD_ETH_EVENTS = [
  {
    type: "event",
    name: "DirectWithdrawalSuccessed",
    inputs: [
      { name: "withdrawalHash", type: "bytes32", indexed: true },
      { name: "recipient", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "WithdrawalFeeCollected",
    inputs: [
      { name: "token", type: "uint32", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const satisfies readonly AbiEvent[];
