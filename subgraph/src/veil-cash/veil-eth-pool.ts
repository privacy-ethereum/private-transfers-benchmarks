import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  VeilCashOperationStats,
  VeilCashProtocolStats,
  VeilCashTransfer,
  VeilCashTransferStats,
} from "../../generated/schema";
import { NewNullifier as NewNullifierEvent } from "../../generated/VeilETHPool/VeilETHPool";

export const VEIL_ETH_POOL_ADDRESS = Address.fromString("0x293dcda114533ff8f477271c5ca517209ffdeee7");

export function createOrLoadProtocolStats(): VeilCashProtocolStats {
  const id = "veil-cash-protocol-stats";
  let stats = VeilCashProtocolStats.load(id);

  if (stats === null) {
    stats = new VeilCashProtocolStats(id);
    stats.totalTxCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();

    const queueStats = new VeilCashOperationStats(`${id}-deposit-queued`);
    const acceptedStats = new VeilCashOperationStats(`${id}-deposit-accepted`);
    const transferStats = new VeilCashOperationStats(`${id}-transfer`);
    const withdrawStats = new VeilCashOperationStats(`${id}-withdraw`);

    stats.depositQueued = queueStats.id;
    stats.depositAccepted = acceptedStats.id;
    stats.transfer = transferStats.id;
    stats.withdraw = withdrawStats.id;

    queueStats.totalCount = BigInt.zero();
    queueStats.totalGasUsed = BigInt.zero();

    acceptedStats.totalCount = BigInt.zero();
    acceptedStats.totalGasUsed = BigInt.zero();

    transferStats.totalCount = BigInt.zero();
    transferStats.totalGasUsed = BigInt.zero();

    withdrawStats.totalCount = BigInt.zero();
    withdrawStats.totalGasUsed = BigInt.zero();

    queueStats.save();
    acceptedStats.save();
    transferStats.save();
    withdrawStats.save();
    stats.save();
  }

  return stats;
}

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

export function handleNewNullifier(event: NewNullifierEvent): void {
  const txId = event.transaction.hash.toHex();

  const receipt = event.receipt;

  if (receipt === null) {
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

  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));
  stats.totalGasUsed = stats.totalGasUsed.plus(receipt.gasUsed);
  stats.save();

  const operationStats = VeilCashOperationStats.load(stats.transfer);

  if (operationStats !== null) {
    operationStats.totalCount = operationStats.totalCount.plus(BigInt.fromI32(1));
    operationStats.totalGasUsed = operationStats.totalGasUsed.plus(receipt.gasUsed);
    operationStats.save();
  }

  const transferStats = createOrLoadTransferStats(stats.transfer);

  transferStats.totalCount = transferStats.totalCount.plus(BigInt.fromI32(1));
  transferStats.totalGasUsed = transferStats.totalGasUsed.plus(receipt.gasUsed);
  transferStats.save();
}
