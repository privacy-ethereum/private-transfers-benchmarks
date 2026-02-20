import { parseAbiItem, type Hex } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";

/**
 * Maximum number of logs with a Deposited event to be searched.
 * Depends on the ratio of how many AA txs - EOA txs
 */
export const MAX_OF_LOGS = NUMBER_OF_TRANSACTIONS * 10;

/**
 * Intmax froze deposits so we will hit rate limit if we search logs from the latest block.
 */
export const DEPOSIT_ETH_FROM_BLOCK = 24402900n;

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
 * I couldn't find the specific event in the codebase. Intmax uses this package https://www.npmjs.com/package/@predicate/contracts)
 * Deposited() - To notify the deposit to the INTMAX network (emitted by the Liquidity contract)
 *
 * Example:
 * https://etherscan.io/tx/0x6de98a249147cb1b384add0a9e1770094728fffbe811f9909ba0c59c528e4d37
 *
 * NOTE: Intmax paused deposits and withdrawals due to a ZK bug on Feb 7th, 2026. There are a lot of reverted txs since then
 * Reference: https://x.com/intmaxIO/status/2020114765171855805
 */
export const DEPOSIT_ETH_EVENTS = [
  parseAbiItem(
    "event TaskValidated(address indexed msgSender, address indexed target, uint256 indexed value, string policyID, string taskId, uint256 quorumThresholdCount, uint256 expireByTime, address[] signerAddresses)",
  ),
  parseAbiItem(
    "event Deposited(uint256 indexed depositId, address indexed sender, bytes32 indexed recipientSaltHash, uint32 tokenIndex, uint256 amount, bool isEligible, uint256 depositedAt)",
  ),
] as const;

/**
 * Intmax froze withdrawals so we will hit rate limit if we search logs from the latest block.
 */
export const WITHDRAW_ETH_FROM_BLOCK = 29328200n;

/**
 * INTMAX Withdrawal contract on Scroll (L2) that handles withdrawal proof submission and processing:
 * https://github.com/InternetMaximalism/intmax2-contract/blob/main/contracts/withdrawal/Withdrawal.sol
 */
export const INTMAX_WITHDRAWAL_PROXY: Hex = "0x86B06D2604D9A6f9760E8f691F86d5B2a7C9c449";

/**
 * Withdrawal.submitWithdrawalProof function on Scroll (L2) - Called by the end user to initiate withdrawal to Ethereum.
 * https://github.com/InternetMaximalism/intmax2-contract/blob/main/contracts/withdrawal/Withdrawal.sol#L147
 *
 * This is the user-facing transaction that initiates the withdrawal process:
 * 1. User submits withdrawal proof on Withdrawal contract (Scroll L2) - this is the tx the end user pays
 * 2. Withdrawal contract validates the ZK proof and marks withdrawals
 * 3. Withdrawal contract sends cross-chain message to Liquidity contract (Ethereum L1)
 * 4. On Ethereum, Liquidity.processWithdrawals delivers assets to recipient
 *
 * Emits:
 * DirectWithdrawalQueued() - Emitted for each withdrawal that can be sent directly (direct withdrawal tokens)
 * DirectWithdrawalQueued() - Emitted for each withdrawal
 * DirectWithdrawalQueued() - Emitted for each withdrawal
 * DirectWithdrawalQueued() - Emitted for each withdrawal
 * DirectWithdrawalQueued() - Emitted for each withdrawal
 * AppendMessage() - From the L2 Message Queue (0x5300000000000000000000000000000000000000)
 * SentMessage()- From the L2 Scroll Messenger (0x781e90f1c8fc4611c9b7497c3b47f99ef6969cbc)
 * ContributionRecorded() - From the Contribution contract to track withdrawal contributions
 *
 * Example:
 * https://scrollscan.com/tx/0x7613bc4349afc1946cb124ea4c64b295951c101d87c808f9b1ae3950268a3747#eventlog
 */
export const WITHDRAW_ETH_EVENTS = [
  parseAbiItem(
    "event DirectWithdrawalQueued(bytes32 indexed withdrawalHash, address indexed recipient, (address, uint32, uint256, bytes32) withdrawal)",
  ),
  parseAbiItem(
    "event DirectWithdrawalQueued(bytes32 indexed withdrawalHash, address indexed recipient, (address, uint32, uint256, bytes32) withdrawal)",
  ),
  parseAbiItem(
    "event DirectWithdrawalQueued(bytes32 indexed withdrawalHash, address indexed recipient, (address, uint32, uint256, bytes32) withdrawal)",
  ),
  parseAbiItem(
    "event DirectWithdrawalQueued(bytes32 indexed withdrawalHash, address indexed recipient, (address, uint32, uint256, bytes32) withdrawal)",
  ),
  parseAbiItem(
    "event DirectWithdrawalQueued(bytes32 indexed withdrawalHash, address indexed recipient, (address, uint32, uint256, bytes32) withdrawal)",
  ),
  parseAbiItem("event AppendMessage(uint256 index, bytes32 messageHash)"),
  parseAbiItem(
    "event SentMessage(address indexed sender, address indexed target, uint256 value, uint256 messageNonce, uint256 gasLimit, bytes message)",
  ),
  parseAbiItem(
    "event ContributionRecorded(uint256 indexed periodNumber, bytes32 indexed tag, address indexed user, uint256 amount)",
  ),
] as const;
