import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  BlanksquareDeposit,
  BlanksquareDepositStats,
  BlanksquareOperationStats,
  BlanksquareProtocolStats,
  BlanksquareWithdraw,
  BlanksquareWithdrawStats,
} from "../../generated/schema";
import { Deposit, Withdraw } from "../../generated/Shielder/Shielder";

function createOrLoadProtocolStats(): BlanksquareProtocolStats {
  const id = "blanksquare-protocol-stats";
  let stats = BlanksquareProtocolStats.load(id);

  if (stats === null) {
    stats = new BlanksquareProtocolStats(id);
    stats.totalTxCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();

    const depositStats = new BlanksquareOperationStats(`${id}-deposit`);
    const withdrawStats = new BlanksquareOperationStats(`${id}-withdraw`);

    stats.deposit = depositStats.id;
    stats.withdraw = withdrawStats.id;

    depositStats.totalCount = BigInt.zero();
    depositStats.totalGasUsed = BigInt.zero();
    depositStats.totalValue = BigInt.zero();

    withdrawStats.totalCount = BigInt.zero();
    withdrawStats.totalGasUsed = BigInt.zero();
    withdrawStats.totalValue = BigInt.zero();

    stats.save();
    depositStats.save();
    withdrawStats.save();
  }

  return stats;
}

export function saveProtocolStats(event: ethereum.Event): void {
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  stats.save();
}

function createOrLoadDepositStats(tokenAddress: Bytes, operationStatsId: string): BlanksquareDepositStats {
  const isNativeETH = tokenAddress.equals(Address.zero());
  const id = isNativeETH ? "blanksquare-deposit-native-eth" : tokenAddress.toHex();
  let stats = BlanksquareDepositStats.load(id);

  if (stats === null) {
    stats = new BlanksquareDepositStats(id);
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();
    stats.operationStats = operationStatsId;
    stats.save();
  }

  return stats;
}

function createOrLoadWithdrawStats(tokenAddress: Bytes, operationStatsId: string): BlanksquareWithdrawStats {
  const isNativeETH = tokenAddress.equals(Address.zero());
  const id = isNativeETH ? "blanksquare-withdraw-native-eth" : tokenAddress.toHex();
  let stats = BlanksquareWithdrawStats.load(id);

  if (stats === null) {
    stats = new BlanksquareWithdrawStats(id);
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();
    stats.operationStats = operationStatsId;
    stats.save();
  }

  return stats;
}

function saveOperationStats(operationId: string, event: ethereum.Event, value: BigInt): void {
  const operationStats = BlanksquareOperationStats.load(operationId);

  if (operationStats !== null) {
    operationStats.totalCount = operationStats.totalCount.plus(BigInt.fromI32(1));

    if (event.receipt !== null) {
      operationStats.totalGasUsed = operationStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    operationStats.totalValue = operationStats.totalValue.plus(value);
    operationStats.save();
  }
}

export function handleDeposit(event: Deposit): void {
  const stats = createOrLoadProtocolStats();
  const operationId = stats.deposit;
  const amount = event.params.amount;
  const tokenAddress = event.params.tokenAddress;

  saveProtocolStats(event);
  saveOperationStats(operationId, event, amount);

  const depositStats = createOrLoadDepositStats(tokenAddress, operationId);

  if (event.receipt !== null) {
    depositStats.totalGasUsed = depositStats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  depositStats.operationStats = operationId;
  depositStats.totalCount = depositStats.totalCount.plus(BigInt.fromI32(1));
  depositStats.totalValue = depositStats.totalValue.plus(amount);

  depositStats.save();

  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const deposit = new BlanksquareDeposit(id);

  deposit.value = amount;
  deposit.tokenAddress = tokenAddress;

  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.txHash = event.transaction.hash;
  deposit.gasPrice = event.transaction.gasPrice;

  if (event.receipt !== null) {
    deposit.gasUsed = event.receipt!.gasUsed;
  }

  deposit.save();
}

export function handleWithdraw(event: Withdraw): void {
  const stats = createOrLoadProtocolStats();
  const operationId = stats.withdraw;
  const amount = event.params.amount;
  const tokenAddress = event.params.tokenAddress;

  saveProtocolStats(event);
  saveOperationStats(operationId, event, amount);

  const withdrawStats = createOrLoadWithdrawStats(tokenAddress, operationId);

  if (event.receipt !== null) {
    withdrawStats.totalGasUsed = withdrawStats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  withdrawStats.operationStats = operationId;
  withdrawStats.totalCount = withdrawStats.totalCount.plus(BigInt.fromI32(1));
  withdrawStats.totalValue = withdrawStats.totalValue.plus(amount);

  withdrawStats.save();

  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const withdraw = new BlanksquareWithdraw(id);

  withdraw.value = amount;
  withdraw.tokenAddress = tokenAddress;

  withdraw.blockNumber = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  withdraw.txHash = event.transaction.hash;
  withdraw.gasPrice = event.transaction.gasPrice;

  if (event.receipt !== null) {
    withdraw.gasUsed = event.receipt!.gasUsed;
  }

  withdraw.save();
}
