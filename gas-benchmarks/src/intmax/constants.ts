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
 * Liquidity.depositNativeToken function:
 * https://github.com/InternetMaximalism/intmax2-contract/blob/main/contracts/liquidity/Liquidity.sol
 *
 * Emits:
 * Deposited() - To notify the deposit to the INTMAX network (emitted by the Liquidity contract)
 *
 * Example:
 * https://etherscan.io/address/0xF65e73aAc9182e353600a916a6c7681F810f79C3
 */
export const SHIELD_ETH_EVENTS = [
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
 * Liquidity.processWithdrawals function (single direct native ETH withdrawal with fee):
 * https://github.com/InternetMaximalism/intmax2-contract/blob/main/contracts/liquidity/Liquidity.sol
 *
 * Emits:
 * DirectWithdrawalSuccessed() - To notify the successful direct withdrawal (emitted by the Liquidity contract)
 * WithdrawalFeeCollected() - To notify the fee collection (emitted by the Liquidity contract)
 *
 * Note: processWithdrawals is called by the withdrawal aggregator and typically batches
 * multiple withdrawals per transaction. This event list targets the minimal case of
 * a single direct withdrawal with fee. It may need adjustment based on observed on-chain data.
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
