import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import { ShieldedNative as ShieldedNativeEvent } from "../../generated/ConfidentialETH/ConfidentialETH";
import {
  RedactShieldedStats,
  RedactOperationStats,
  RedactProtocolStats,
  RedactShieldedNative,
} from "../../generated/schema";

function createOrLoadProtocolStats(): RedactProtocolStats {
  const id = "redact-protocol-stats";
  let stats = RedactProtocolStats.load(id);

  if (stats == null) {
    stats = new RedactProtocolStats(id);
    stats.totalTxCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    const shieldedNativeStats = new RedactOperationStats(`${id}-shield-native`);

    stats.shieldedNative = shieldedNativeStats.id;
    shieldedNativeStats.totalCount = BigInt.fromI32(0);
    shieldedNativeStats.totalGasUsed = BigInt.fromI32(0);

    stats.save();
    shieldedNativeStats.save();
  }

  return stats;
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

export function handleShieldedNative(event: ShieldedNativeEvent): void {
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  const shieldOperationStats = RedactOperationStats.load(stats.shieldedNative);

  if (shieldOperationStats !== null) {
    shieldOperationStats.totalCount = shieldOperationStats.totalCount.plus(BigInt.fromI32(1));

    if (event.receipt !== null) {
      shieldOperationStats.totalGasUsed = shieldOperationStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    shieldOperationStats.save();
  }

  if (shieldOperationStats !== null) {
    const shieldedStats = createOrLoadShieldedStats(null, shieldOperationStats.id);

    if (event.receipt !== null) {
      shieldedStats.totalGasUsed = shieldedStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    shieldedStats.operationStats = shieldOperationStats.id;
    shieldedStats.totalCount = shieldedStats.totalCount.plus(BigInt.fromI32(1));
    shieldedStats.totalValue = shieldedStats.totalValue.plus(event.params.value);

    shieldedStats.save();
  }

  stats.save();

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
