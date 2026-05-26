import { Address, BigInt } from "@graphprotocol/graph-ts";

import { VeilCashWithdraw, VeilCashOperationStats, VeilCashWithdrawStats } from "../../generated/schema";
import { Withdrawal as WithdrawalEvent } from "../../generated/WETH/WETH";

import { createOrLoadProtocolStats } from "./veil-eth-pool";

export const VEIL_ETH_POOL_CONTRACT_ADDRESS = Address.fromString("0x293dCda114533FF8f477271c5cA517209FFDEEe7");

function createOrLoadWithdrawStats(operationStatsId: string): VeilCashWithdrawStats {
  const id = "veil-cash-withdraw-native-eth";
  let stats = VeilCashWithdrawStats.load(id);

  if (stats === null) {
    stats = new VeilCashWithdrawStats(id);
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();
    stats.operationStats = operationStatsId;
    stats.save();
  }

  return stats;
}

export function handleWithdrawal(event: WithdrawalEvent): void {
  const id = `${event.transaction.hash.toHex()}`;

  let withdraw = VeilCashWithdraw.load(id);

  if (withdraw != null) {
    return; // tx already processed
  }

  if (event.receipt === null) {
    return; // we need the receipt to gas used
  }

  if (event.transaction.to === null) {
    return; // contract creation tx, not a withdrawal from existing contract
  }

  if (!event.transaction.to!.equals(VEIL_ETH_POOL_CONTRACT_ADDRESS)) {
    return; // not a withdrawal from VEIL ETH pool contract
  }

  withdraw = new VeilCashWithdraw(id);
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

  const operationStats = VeilCashOperationStats.load(stats.withdraw);

  if (operationStats != null) {
    operationStats.totalCount = operationStats.totalCount.plus(BigInt.fromI32(1));
    operationStats.totalGasUsed = operationStats.totalGasUsed.plus(event.receipt!.gasUsed);
    operationStats.save();
  }

  const withdrawStats = createOrLoadWithdrawStats(stats.withdraw);

  withdrawStats.totalCount = withdrawStats.totalCount.plus(BigInt.fromI32(1));
  withdrawStats.totalGasUsed = withdrawStats.totalGasUsed.plus(event.receipt!.gasUsed);
  withdrawStats.totalValue = withdrawStats.totalValue.plus(event.params.wad);
  withdrawStats.save();
}
