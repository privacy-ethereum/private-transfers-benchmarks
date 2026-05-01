import { BigInt } from "@graphprotocol/graph-ts";

import {
  FluidkeyOperationRelayed,
  FluidkeyOperationStats,
  FluidkeyProtocolStats,
  FluidkeyStealthToPublicStats,
} from "../../generated/schema";
import { OperationRelayed as OperationRelayedEvent } from "../../generated/SmartAccountRelayer/SmartAccountRelayer";

function createOrLoadProtocolStats(): FluidkeyProtocolStats {
  const id = "fluidkey-protocol-stats";
  let stats = FluidkeyProtocolStats.load(id);

  if (stats == null) {
    stats = new FluidkeyProtocolStats(id);
    stats.totalTxCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    const stealthToPublicStats = new FluidkeyOperationStats(`${id}-stealth-to-public`);

    stats.stealthToPublic = stealthToPublicStats.id;
    stealthToPublicStats.totalCount = BigInt.fromI32(0);
    stealthToPublicStats.totalGasUsed = BigInt.fromI32(0);

    stats.save();
    stealthToPublicStats.save();
  }

  return stats;
}

function createOrLoadStealthToPublicStats(operationStatsId: string): FluidkeyStealthToPublicStats {
  const id = operationStatsId;
  let stats = FluidkeyStealthToPublicStats.load(id);

  if (stats == null) {
    stats = new FluidkeyStealthToPublicStats(id);
    stats.operationStats = operationStatsId;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    stats.save();
  }

  return stats;
}

export function handleOperationRelayed(event: OperationRelayedEvent): void {
  if (!event.params.success) {
    return;
  }

  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  stats.save();

  const operationStats = FluidkeyOperationStats.load(stats.stealthToPublic);

  if (operationStats !== null) {
    operationStats.totalCount = operationStats.totalCount.plus(BigInt.fromI32(1));

    if (event.receipt !== null) {
      operationStats.totalGasUsed = operationStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    operationStats.save();
  }

  const stealthToPublicStats = createOrLoadStealthToPublicStats(stats.stealthToPublic);

  stealthToPublicStats.totalCount = stealthToPublicStats.totalCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stealthToPublicStats.totalGasUsed = stealthToPublicStats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  stealthToPublicStats.save();

  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const operationRelayed = new FluidkeyOperationRelayed(id);
  operationRelayed.from = event.transaction.from;

  operationRelayed.blockNumber = event.block.number;
  operationRelayed.timestamp = event.block.timestamp;
  operationRelayed.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    operationRelayed.gasUsed = event.receipt!.gasUsed;
  }

  operationRelayed.gasPrice = event.transaction.gasPrice;

  operationRelayed.save();
}
