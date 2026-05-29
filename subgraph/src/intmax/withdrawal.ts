import { BigInt } from "@graphprotocol/graph-ts";

import {
  IntmaxScrollWithdrawal,
  IntmaxScrollWithdrawalStats,
  IntmaxScrollOperationStats,
  IntmaxScrollProtocolStats,
} from "../../generated/schema";
import { DirectWithdrawalQueued } from "../../generated/Withdrawal/Withdrawal";

import { calculateDirectWithdrawalQueuedEvents } from "./utils";

function createOrLoadProtocolStats(): IntmaxScrollProtocolStats {
  const id = "intmax-scroll-protocol-stats";
  let stats = IntmaxScrollProtocolStats.load(id);

  if (stats === null) {
    stats = new IntmaxScrollProtocolStats(id);

    stats.totalTxCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();

    const withdrawalStats = new IntmaxScrollOperationStats(`${id}-withdrawal`);
    stats.withdrawal = withdrawalStats.id;

    withdrawalStats.totalCount = BigInt.zero();
    withdrawalStats.totalGasUsed = BigInt.zero();

    stats.save();
    withdrawalStats.save();
  }

  return stats;
}

function createOrLoadWithdrawalStats(tokenIndex: BigInt, operationStatsId: string): IntmaxScrollWithdrawalStats {
  const id = `intmax-scroll-withdrawal-${tokenIndex.toString()}`;

  let stats = IntmaxScrollWithdrawalStats.load(id);

  if (stats === null) {
    stats = new IntmaxScrollWithdrawalStats(id);

    stats.operationStats = operationStatsId;
    stats.tokenIndex = tokenIndex;
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();

    stats.save();
  }

  return stats;
}

export function handleWithdrawal(event: DirectWithdrawalQueued): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;

  const withdrawal = new IntmaxScrollWithdrawal(id);
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  const withdrawalStats = IntmaxScrollOperationStats.load(stats.withdrawal);
  const withdrawalCount = calculateDirectWithdrawalQueuedEvents(
    event.receipt !== null ? event.receipt!.logs : [],
  ) as i32;
  const totalWithdrawals = BigInt.fromI32(withdrawalCount || 1);

  if (withdrawalStats !== null) {
    withdrawalStats.totalCount = withdrawalStats.totalCount.plus(BigInt.fromI32(1));

    if (event.receipt !== null) {
      withdrawalStats.totalGasUsed = withdrawalStats.totalGasUsed.plus(event.receipt!.gasUsed.div(totalWithdrawals));
    }

    withdrawalStats.save();
  }

  stats.save();

  const withdrawalData = event.params.withdrawal;
  const tokenIndex = withdrawalData.tokenIndex;

  withdrawal.tokenIndex = tokenIndex;
  withdrawal.amount = withdrawalData.amount;
  withdrawal.blockNumber = event.block.number;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    withdrawal.gasUsed = event.receipt!.gasUsed.div(totalWithdrawals);
  }

  withdrawal.gasPrice = event.transaction.gasPrice;
  withdrawal.save();

  if (withdrawalStats !== null) {
    const tokenStats = createOrLoadWithdrawalStats(tokenIndex, withdrawalStats.id);

    tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));
    tokenStats.totalValue = tokenStats.totalValue.plus(withdrawalData.amount);

    if (event.receipt !== null) {
      tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(event.receipt!.gasUsed.div(totalWithdrawals));
    }

    tokenStats.save();
  }
}
