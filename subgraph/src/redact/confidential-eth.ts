import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  ShieldedNative as ShieldedNativeEvent,
  Unshielded as UnshieldedEvent,
} from "../../generated/ConfidentialETH/ConfidentialETH";
import {
  RedactShieldedStats,
  RedactUnshieldedStats,
  RedactOperationStats,
  RedactProtocolStats,
  RedactShieldedNative,
  RedactUnshielded,
} from "../../generated/schema";

function createOrLoadProtocolStats(): RedactProtocolStats {
  const id = "redact-protocol-stats";
  let stats = RedactProtocolStats.load(id);

  if (stats == null) {
    stats = new RedactProtocolStats(id);
    stats.totalTxCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    const shieldedNativeStats = new RedactOperationStats(`${id}-shield-native`);
    const unshieldedStats = new RedactOperationStats(`${id}-unshielded`);

    stats.shieldedNative = shieldedNativeStats.id;
    stats.unshielded = unshieldedStats.id;

    shieldedNativeStats.totalCount = BigInt.fromI32(0);
    shieldedNativeStats.totalGasUsed = BigInt.fromI32(0);

    unshieldedStats.totalCount = BigInt.fromI32(0);
    unshieldedStats.totalGasUsed = BigInt.fromI32(0);

    stats.save();
    shieldedNativeStats.save();
    unshieldedStats.save();
  }

  return stats;
}

function saveProtocolStats(event: ethereum.Event): void {
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  stats.save();
}

function createOrLoadShieldedStats(tokenAddress: Bytes | null, operationStatsId: string): RedactShieldedStats {
  const id = tokenAddress === null ? "native-eth" : tokenAddress.toHex();
  let stats = RedactShieldedStats.load(id);

  if (stats == null) {
    stats = new RedactShieldedStats(id);
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);
    stats.totalValue = BigInt.fromI32(0);
    stats.operationStats = operationStatsId;

    if (tokenAddress !== null) {
      stats.tokenAddress = tokenAddress;
    }

    stats.save();
  }

  return stats;
}

function createOrLoadUnshieldedStats(operationStatsId: string): RedactUnshieldedStats {
  const id = "native-eth";
  let stats = RedactUnshieldedStats.load(id);

  if (stats == null) {
    stats = new RedactUnshieldedStats(id);
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);
    stats.totalValue = BigInt.fromI32(0);
    stats.operationStats = operationStatsId;

    stats.save();
  }

  return stats;
}

function saveOperationStats(operationId: string, event: ethereum.Event): void {
  const operationStats = RedactOperationStats.load(operationId);

  if (operationStats !== null) {
    operationStats.totalCount = operationStats.totalCount.plus(BigInt.fromI32(1));

    if (event.receipt !== null) {
      operationStats.totalGasUsed = operationStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    operationStats.save();
  }
}

export function handleShieldedNative(event: ShieldedNativeEvent): void {
  const stats = createOrLoadProtocolStats();
  const operationId = stats.shieldedNative;

  saveProtocolStats(event);
  saveOperationStats(operationId, event);

  const shieldedStats = createOrLoadShieldedStats(null, operationId);

  if (event.receipt !== null) {
    shieldedStats.totalGasUsed = shieldedStats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  shieldedStats.operationStats = operationId;
  shieldedStats.totalCount = shieldedStats.totalCount.plus(BigInt.fromI32(1));
  shieldedStats.totalValue = shieldedStats.totalValue.plus(event.params.value);

  shieldedStats.save();

  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const shield = new RedactShieldedNative(id);

  shield.from = event.params.from;
  shield.to = event.params.to;
  shield.value = event.params.value;

  shield.blockNumber = event.block.number;
  shield.timestamp = event.block.timestamp;
  shield.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    shield.gasUsed = event.receipt!.gasUsed;
  }

  shield.gasPrice = event.transaction.gasPrice;

  shield.save();
}

export function handleUnshielded(event: UnshieldedEvent): void {
  const stats = createOrLoadProtocolStats();
  saveProtocolStats(event);

  const operationId = stats.unshielded;
  saveOperationStats(operationId, event);

  const unshieldedStats = createOrLoadUnshieldedStats(operationId);

  if (event.receipt !== null) {
    unshieldedStats.totalGasUsed = unshieldedStats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  unshieldedStats.operationStats = operationId;
  unshieldedStats.totalCount = unshieldedStats.totalCount.plus(BigInt.fromI32(1));
  // TODO: calculate unshieldedStats.totalValue for unshielded events using the Transfer() event

  unshieldedStats.save();

  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const unshield = new RedactUnshielded(id);

  unshield.to = event.params.to;
  unshield.amount = event.params.amount;

  unshield.blockNumber = event.block.number;
  unshield.timestamp = event.block.timestamp;
  unshield.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    unshield.gasUsed = event.receipt!.gasUsed;
  }

  unshield.gasPrice = event.transaction.gasPrice;

  unshield.save();
}
