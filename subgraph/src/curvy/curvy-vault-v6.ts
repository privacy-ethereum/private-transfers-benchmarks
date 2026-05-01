import { BigInt } from "@graphprotocol/graph-ts";

import { Withdraw as WithdrawEvent } from "../../generated/CurvyVaultV6/CurvyVaultV6";
import {
  CurvyOperationStats,
  CurvyProtocolStats,
  CurvyStealthToPublicStats,
  CurvyWithdraw,
} from "../../generated/schema";

function createOrLoadProtocolStats(): CurvyProtocolStats {
  const id = "curvy-protocol-stats";
  let stats = CurvyProtocolStats.load(id);

  if (stats == null) {
    stats = new CurvyProtocolStats(id);
    stats.totalTxCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    const stealthToPublicStats = new CurvyOperationStats(`${id}-stealth-to-public`);

    stats.stealthToPublic = stealthToPublicStats.id;
    stealthToPublicStats.totalCount = BigInt.fromI32(0);
    stealthToPublicStats.totalGasUsed = BigInt.fromI32(0);

    stats.save();
    stealthToPublicStats.save();
  }

  return stats;
}

function createOrLoadStealthToPublicStats(operationStatsId: string): CurvyStealthToPublicStats {
  const id = operationStatsId;
  let stats = CurvyStealthToPublicStats.load(id);

  if (stats == null) {
    stats = new CurvyStealthToPublicStats(id);
    stats.operationStats = operationStatsId;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    stats.save();
  }

  return stats;
}

export function handleWithdraw(event: WithdrawEvent): void {
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  stats.save();

  const operationStats = CurvyOperationStats.load(stats.stealthToPublic);

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
  const withdraw = new CurvyWithdraw(id);

  withdraw.from = event.transaction.from;
  withdraw.tokenAddress = event.params.tokenAddress;
  withdraw.to = event.params.to;
  withdraw.amount = event.params.amount;

  withdraw.blockNumber = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  withdraw.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    withdraw.gasUsed = event.receipt!.gasUsed;
  }

  withdraw.gasPrice = event.transaction.gasPrice;

  withdraw.save();
}
