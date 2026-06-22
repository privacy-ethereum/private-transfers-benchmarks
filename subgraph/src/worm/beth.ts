import { BigInt, ethereum } from "@graphprotocol/graph-ts";

import { Transfer } from "../../generated/BETH/BETH";
import { WormWithdrawStats, WormProtocolStats, WormWithdraw } from "../../generated/schema";

import { getWithdrawalEvent } from "./utils";

function createOrLoadProtocolStats(): WormProtocolStats {
  const id = "worm-protocol-stats";
  let stats = WormProtocolStats.load(id);

  if (stats === null) {
    stats = new WormProtocolStats(id);
    stats.totalTxCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();

    const withdrawStats = new WormWithdrawStats(`${id}-withdraw`);
    stats.withdraw = withdrawStats.id;
    withdrawStats.totalCount = BigInt.zero();
    withdrawStats.totalGasUsed = BigInt.zero();
    withdrawStats.totalValue = BigInt.zero();

    withdrawStats.save();
    stats.save();
  }

  return stats;
}

function createOrLoadWithdrawStats(): WormWithdrawStats {
  const id = "worm-protocol-stats-withdraw";
  let stats = WormWithdrawStats.load(id);

  if (stats === null) {
    stats = new WormWithdrawStats(id);
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();
    stats.save();
  }

  return stats;
}

export function handleTransfer(event: Transfer): void {
  const receipt = event.receipt;

  if (receipt === null) {
    return;
  }

  const withdrawalEvent = getWithdrawalEvent(receipt.logs);

  if (withdrawalEvent === null) {
    return;
  }

  const txHash = event.transaction.hash.toHex();
  const existingWithdraw = WormWithdraw.load(txHash);

  if (existingWithdraw !== null) {
    return;
  }

  const stats = createOrLoadProtocolStats();
  const withdrawStats = createOrLoadWithdrawStats();
  const decoded = ethereum.decode("uint256", withdrawalEvent.data);
  const value = decoded ? decoded.toBigInt() : BigInt.zero();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));
  stats.totalGasUsed = stats.totalGasUsed.plus(receipt.gasUsed);
  stats.withdraw = withdrawStats.id;
  stats.save();

  withdrawStats.totalCount = withdrawStats.totalCount.plus(BigInt.fromI32(1));
  withdrawStats.totalGasUsed = withdrawStats.totalGasUsed.plus(receipt.gasUsed);
  withdrawStats.totalValue = withdrawStats.totalValue.plus(value);
  withdrawStats.save();

  const withdraw = new WormWithdraw(txHash);

  withdraw.blockNumber = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  withdraw.txHash = event.transaction.hash;
  withdraw.value = value;
  withdraw.gasUsed = receipt.gasUsed;
  withdraw.gasPrice = event.transaction.gasPrice;

  withdraw.save();
}
