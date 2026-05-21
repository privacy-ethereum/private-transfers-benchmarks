import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import { ZERC20Teleport, ZERC20TeleportStats } from "../../generated/schema";
import { Teleport as TeleportEvent } from "../../generated/zERC20/zERC20";

import { createOrLoadProtocolStats, saveOperationStats, saveProtocolStats } from "./liquidity-manager";

function createOrLoadTeleportStats(tokenAddress: Bytes | null, operationStatsId: string): ZERC20TeleportStats {
  const id = tokenAddress === null ? "zerc20-teleport-native-eth" : tokenAddress.toHex();
  let stats = ZERC20TeleportStats.load(id);

  if (stats == null) {
    stats = new ZERC20TeleportStats(id);
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

export function handleTeleport(event: TeleportEvent): void {
  const stats = createOrLoadProtocolStats();
  const operationId = stats.teleport;
  const teleportedValue = event.params.value;

  saveProtocolStats(event);
  saveOperationStats(operationId, event, teleportedValue);

  const teleportStats = createOrLoadTeleportStats(null, operationId);

  if (event.receipt !== null) {
    teleportStats.totalGasUsed = teleportStats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  teleportStats.operationStats = operationId;
  teleportStats.totalCount = teleportStats.totalCount.plus(BigInt.fromI32(1));
  teleportStats.totalValue = teleportStats.totalValue.plus(teleportedValue);

  teleportStats.save();

  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const teleport = new ZERC20Teleport(id);

  teleport.from = event.transaction.from;
  teleport.to = event.params.to;
  teleport.value = teleportedValue;

  teleport.blockNumber = event.block.number;
  teleport.timestamp = event.block.timestamp;
  teleport.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    teleport.gasUsed = event.receipt!.gasUsed;
  }

  teleport.gasPrice = event.transaction.gasPrice;

  teleport.save();
}
