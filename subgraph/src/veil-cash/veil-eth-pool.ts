import { BigInt } from "@graphprotocol/graph-ts";

import {
  VeilCashTransfer,
  VeilCashTransferStats,
  VeilCashWithdraw,
  VeilCashWithdrawStats,
} from "../../generated/schema";
import { NewNullifier as NewNullifierEvent } from "../../generated/VeilETHPool/VeilETHPool";

import { getWithdrawalEvent } from "./utils";
import { createOrLoadProtocolStats, saveOperationStats, saveProtocolStats } from "./veil-eth-queue-v3";

function createOrLoadTransferStats(operationStatsId: string): VeilCashTransferStats {
  const id = "veil-cash-transfer-native-eth";
  let stats = VeilCashTransferStats.load(id);

  if (stats === null) {
    stats = new VeilCashTransferStats(id);
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();
    stats.operationStats = operationStatsId;
    stats.save();
  }

  return stats;
}

function createOrLoadWithdrawStats(operationStatsId: string): VeilCashWithdrawStats {
  const id = "veil-cash-withdraw-native-eth";
  let stats = VeilCashWithdrawStats.load(id);

  if (stats === null) {
    stats = new VeilCashWithdrawStats(id);
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();
    stats.operationStats = operationStatsId;
    stats.save();
  }

  return stats;
}

export function handleNewNullifier(event: NewNullifierEvent): void {
  const txId = event.transaction.hash.toHex();
  const stats = createOrLoadProtocolStats();

  const receipt = event.receipt;

  if (receipt === null) {
    return;
  }

  const withdrawalEvent = getWithdrawalEvent(receipt.logs);

  if (withdrawalEvent !== null) {
    const existingWithdraw = VeilCashWithdraw.load(txId);

    if (existingWithdraw !== null) {
      return;
    }

    const withdraw = new VeilCashWithdraw(txId);
    const value = BigInt.fromUnsignedBytes(withdrawalEvent.data);

    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.txHash = event.transaction.hash;
    withdraw.value = value;
    withdraw.gasUsed = receipt.gasUsed;
    withdraw.gasPrice = event.transaction.gasPrice;

    withdraw.save();

    const withdrawOperationId = stats.withdraw;

    saveProtocolStats(event);
    saveOperationStats(withdrawOperationId, event);

    const withdrawStats = createOrLoadWithdrawStats(withdrawOperationId);

    withdrawStats.totalCount = withdrawStats.totalCount.plus(BigInt.fromI32(1));
    withdrawStats.totalGasUsed = withdrawStats.totalGasUsed.plus(receipt.gasUsed);
    withdrawStats.totalValue = withdrawStats.totalValue.plus(value);
    withdrawStats.operationStats = withdrawOperationId;
    withdrawStats.save();

    return;
  }

  const existingTransfer = VeilCashTransfer.load(txId);

  if (existingTransfer !== null) {
    return;
  }

  const transfer = new VeilCashTransfer(txId);

  transfer.blockNumber = event.block.number;
  transfer.timestamp = event.block.timestamp;
  transfer.txHash = event.transaction.hash;
  transfer.gasUsed = receipt.gasUsed;
  transfer.gasPrice = event.transaction.gasPrice;

  transfer.save();

  const transferOperationId = stats.transfer;

  saveProtocolStats(event);
  saveOperationStats(transferOperationId, event);

  const transferStats = createOrLoadTransferStats(transferOperationId);

  transferStats.totalCount = transferStats.totalCount.plus(BigInt.fromI32(1));
  transferStats.totalGasUsed = transferStats.totalGasUsed.plus(receipt.gasUsed);
  transferStats.operationStats = transferOperationId;
  transferStats.save();
}
