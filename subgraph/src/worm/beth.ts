import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import { Transfer as TransferEvent } from "../../generated/BETH/BETH";
import { WormOperationStats, WormProtocolStats, WormWithdraw } from "../../generated/schema";
import { logsMatchEvents } from "../utils";

export const WITHDRAW_EVENTS = [
  "Transfer(address,address,uint256)",
  "Transfer(address,address,uint256)",
  "Transfer(address,address,uint256)",
  "Transfer(address,address,uint256)",
  "Transfer(address,address,uint256)",
  "Approval(address,address,uint256)",
  "Transfer(address,address,uint256)",
  "Approval(address,address,uint256)",
  "Transfer(address,address,uint256)",
  "Transfer(address,address,uint256)",
  "Swap(address,address,int256,int256,uint160,uint128,int24,uint24,uint24)",
  "Approval(address,address,uint256)",
  "Withdraw(address,uint256)",
  "Approval(address,address,uint256)",
  "Transfer(address,address,uint256)",
  "Transfer(address,address,uint256)",
  "Approval(address,address,uint256)",
  "Transfer(address,address,uint256)",
  "RewardDeposited(address,uint256,uint256)",
  "Approval(address,address,uint256)",
];

export const INDEX_FOR_WETH_WITHDRAW_EVENT = 12;
export const INDEX_FOR_TRANSFER_TO_FINAL_RECIPIENT_EVENT = 14;

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

export function handleTransfer(event: TransferEvent): void {
  const id = `${event.transaction.hash.toHex()}`;

  let withdraw = WormWithdraw.load(id);
  if (withdraw != null) {
    return; // tx already processed
  }

  if (event.receipt === null) {
    return; // we need the receipt to get the logs/events of the tx
  }

  const isWithdraw = logsMatchEvents(event.receipt!.logs, WITHDRAW_EVENTS);
  if (!isWithdraw) {
    return; // not a withdraw tx, ignore
  }

  // the unwrapped amount of WETH is the amount being sent
  const amountBytes = event.receipt!.logs[INDEX_FOR_WETH_WITHDRAW_EVENT].topics[2];
  // 0 tokens ERC20 transfer event indicating receiver. The transfer is a native ETH internal transfer
  const receiverTopic = event.receipt!.logs[INDEX_FOR_TRANSFER_TO_FINAL_RECIPIENT_EVENT].topics[2];
  const receiverHex = receiverTopic.toHexString();
  const receiver = Bytes.fromHexString(`0x${receiverHex.slice(26)}`);

  withdraw = new WormWithdraw(id);
  withdraw.value = BigInt.fromUnsignedBytes(Bytes.fromUint8Array(amountBytes.reverse()));
  withdraw.to = receiver;

  withdraw.blockNumber = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  withdraw.txHash = event.transaction.hash;
  withdraw.gasUsed = event.receipt!.gasUsed;
  withdraw.gasPrice = event.transaction.gasPrice;

  withdraw.save();

  const stats = createOrLoadProtocolStats();
  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));
  stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);

  const operationStats = WormOperationStats.load(stats.withdraw);

  if (operationStats !== null) {
    operationStats.totalCount = operationStats.totalCount.plus(BigInt.fromI32(1));
    operationStats.totalGasUsed = operationStats.totalGasUsed.plus(event.receipt!.gasUsed);
    operationStats.save();
  }

  stats.save();
}
