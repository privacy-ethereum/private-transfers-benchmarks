import { Address, BigInt } from "@graphprotocol/graph-ts";

import { WormOperationStats, WormProtocolStats, WormWithdraw } from "../../generated/schema";
import { Withdrawal as WithdrawalEvent } from "../../generated/WETH/WETH";

export const BETH_CONTRACT_ADDRESS = Address.fromString("0x5624344235607940d4d4ee76bf8817d403eb9cf8");

function createOrLoadProtocolStats(): WormProtocolStats {
  const id = "worm-protocol-stats";
  let stats = WormProtocolStats.load(id);

  if (stats == null) {
    stats = new WormProtocolStats(id);
    stats.totalTxCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    const withdraw = new WormOperationStats(`${id}-withdraw`);
    stats.withdraw = withdraw.id;

    withdraw.totalCount = BigInt.fromI32(0);
    withdraw.totalGasUsed = BigInt.fromI32(0);

    withdraw.save();
    stats.save();
  }

  return stats;
}

export function handleWithdrawal(event: WithdrawalEvent): void {
  const id = `${event.transaction.hash.toHex()}`;

  let withdraw = WormWithdraw.load(id);

  if (withdraw != null) {
    return; // tx already processed
  }

  if (event.receipt === null) {
    return; // we need the receipt to gas used
  }

  if (event.transaction.to === null) {
    return; // contract creation tx, not a withdrawal from existing contract
  }

  if (!event.transaction.to!.equals(BETH_CONTRACT_ADDRESS)) {
    return; // not a withdrawal from BETH contract
  }

  withdraw = new WormWithdraw(id);
  withdraw.value = event.params.wad;

  withdraw.blockNumber = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  withdraw.txHash = event.transaction.hash;
  withdraw.gasUsed = event.receipt!.gasUsed;
  withdraw.gasPrice = event.transaction.gasPrice;

  withdraw.save();

  const stats = createOrLoadProtocolStats();
  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));
  stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);

  stats.save();

  const operationStats = WormOperationStats.load(stats.withdraw);

  if (operationStats != null) {
    operationStats.totalCount = operationStats.totalCount.plus(BigInt.fromI32(1));
    operationStats.totalGasUsed = operationStats.totalGasUsed.plus(event.receipt!.gasUsed);
    operationStats.save();
  }
}
