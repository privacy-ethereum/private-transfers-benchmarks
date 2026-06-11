import { BigInt, ethereum } from "@graphprotocol/graph-ts";

import {
  VeilCashDepositAccepted,
  VeilCashDepositAcceptedStats,
  VeilCashDepositQueued,
  VeilCashDepositQueuedStats,
  VeilCashOperationStats,
  VeilCashProtocolStats,
} from "../../generated/schema";
import {
  DepositAccepted as DepositAcceptedEvent,
  DepositQueued as DepositQueuedEvent,
} from "../../generated/VeilETHQueueV3/VeilETHQueueV3";

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

    stats.save();
    queueStats.save();
    acceptedStats.save();
    transferStats.save();
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

function createOrLoadDepositQueuedStats(operationStatsId: string): VeilCashDepositQueuedStats {
  const id = "veil-cash-deposit-queued-native-eth";
  let stats = VeilCashDepositQueuedStats.load(id);

  if (stats === null) {
    stats = new VeilCashDepositQueuedStats(id);
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();
    stats.operationStats = operationStatsId;
    stats.save();
  }

  return stats;
}

function createOrLoadDepositAcceptedStats(operationStatsId: string): VeilCashDepositAcceptedStats {
  const id = "veil-cash-deposit-accepted-native-eth";
  let stats = VeilCashDepositAcceptedStats.load(id);

  if (stats === null) {
    stats = new VeilCashDepositAcceptedStats(id);
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();
    stats.operationStats = operationStatsId;
    stats.save();
  }

  return stats;
}

export function saveOperationStats(operationId: string, event: ethereum.Event): void {
  const operationStats = VeilCashOperationStats.load(operationId);

  if (operationStats !== null) {
    operationStats.totalCount = operationStats.totalCount.plus(BigInt.fromI32(1));

    if (event.receipt !== null) {
      operationStats.totalGasUsed = operationStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    operationStats.save();
  }
}

export function handleDepositQueued(event: DepositQueuedEvent): void {
  const stats = createOrLoadProtocolStats();
  const operationId = stats.depositQueued;
  const amount = event.params.amount;

  const receipt = event.receipt;
  if (receipt === null) {
    return;
  }

  saveProtocolStats(event);
  saveOperationStats(operationId, event);

  const depositQueuedStats = createOrLoadDepositQueuedStats(operationId);

  depositQueuedStats.totalGasUsed = depositQueuedStats.totalGasUsed.plus(receipt.gasUsed);

  depositQueuedStats.operationStats = operationId;
  depositQueuedStats.totalCount = depositQueuedStats.totalCount.plus(BigInt.fromI32(1));
  depositQueuedStats.totalValue = depositQueuedStats.totalValue.plus(amount);

  depositQueuedStats.save();

  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const depositQueued = new VeilCashDepositQueued(id);

  depositQueued.nonce = event.params.nonce;
  depositQueued.sender = event.params.sender;
  depositQueued.depositKey = event.params.depositKey;
  depositQueued.value = amount;

  depositQueued.blockNumber = event.block.number;
  depositQueued.timestamp = event.block.timestamp;
  depositQueued.txHash = event.transaction.hash;
  depositQueued.gasPrice = event.transaction.gasPrice;
  depositQueued.gasUsed = receipt.gasUsed;

  depositQueued.save();
}

export function handleDepositAccepted(event: DepositAcceptedEvent): void {
  const stats = createOrLoadProtocolStats();
  const operationId = stats.depositAccepted;
  const amount = event.params.amount;

  const receipt = event.receipt;
  if (receipt === null) {
    return;
  }

  saveProtocolStats(event);
  saveOperationStats(operationId, event);

  const depositAcceptedStats = createOrLoadDepositAcceptedStats(operationId);

  depositAcceptedStats.totalGasUsed = depositAcceptedStats.totalGasUsed.plus(receipt.gasUsed);
  depositAcceptedStats.operationStats = operationId;
  depositAcceptedStats.totalCount = depositAcceptedStats.totalCount.plus(BigInt.fromI32(1));
  depositAcceptedStats.totalValue = depositAcceptedStats.totalValue.plus(amount);

  depositAcceptedStats.save();

  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const depositAccepted = new VeilCashDepositAccepted(id);

  depositAccepted.nonce = event.params.nonce;
  depositAccepted.operator = event.params.operator;
  depositAccepted.veilEntry = event.params.veilEntry;
  depositAccepted.value = amount;

  depositAccepted.blockNumber = event.block.number;
  depositAccepted.timestamp = event.block.timestamp;
  depositAccepted.txHash = event.transaction.hash;
  depositAccepted.gasPrice = event.transaction.gasPrice;
  depositAccepted.gasUsed = receipt.gasUsed;

  depositAccepted.save();
}
