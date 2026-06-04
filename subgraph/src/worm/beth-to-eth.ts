import { BigInt } from "@graphprotocol/graph-ts";

import { SwapBethWithEthCall } from "../../generated/BETHToETH/BETHToETH";
import { WormWithdraw, WormProtocolStats, WormOperationStats } from "../../generated/schema";

const PROTOCOL_ID = "worm-protocol-stats";
const WITHDRAW_ID = "worm-protocol-stats-withdraw";

function getOrCreateWithdrawOperationStats(): WormOperationStats {
  let stats = WormOperationStats.load(WITHDRAW_ID);

  if (stats == null) {
    stats = new WormOperationStats(WITHDRAW_ID);
    stats.totalCount = BigInt.zero();
    stats.save();
  }

  return stats;
}

function getProtocolStats(): WormProtocolStats {
  let stats = WormProtocolStats.load(PROTOCOL_ID);

  if (stats == null) {
    stats = new WormProtocolStats(PROTOCOL_ID);
    stats.totalTxCount = BigInt.zero();

    const withdraw = getOrCreateWithdrawOperationStats();
    stats.withdraw = withdraw.id;

    stats.save();
  }

  return stats;
}

export function handleSwapBethWithEth(call: SwapBethWithEthCall): void {
  const id = call.transaction.hash.toHex();

  let withdraw = WormWithdraw.load(id);

  if (withdraw !== null) {
    return;
  }

  withdraw = new WormWithdraw(id);

  // eslint-disable-next-line no-underscore-dangle
  const inputAmount = call.inputs._swapAmount;

  withdraw.value = inputAmount;
  withdraw.blockNumber = call.block.number;
  withdraw.timestamp = call.block.timestamp;
  withdraw.txHash = call.transaction.hash;
  withdraw.gasPrice = call.transaction.gasPrice;

  withdraw.save();

  const stats = getProtocolStats();
  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));
  stats.save();

  const withdrawStats = getOrCreateWithdrawOperationStats();
  withdrawStats.totalCount = withdrawStats.totalCount.plus(BigInt.fromI32(1));
  withdrawStats.save();
}
