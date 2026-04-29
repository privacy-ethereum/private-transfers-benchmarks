import { BigInt } from "@graphprotocol/graph-ts";

import {
  TornadoCashWithdrawal,
  TornadoCashInstance,
  TornadoCashDeposit,
  TornadoCashProtocolStats,
  TornadoCashOperationStats,
} from "../../generated/schema";
import { Deposit, Withdrawal, TornadoInstance } from "../../generated/templates/TornadoInstance/TornadoInstance";

function createOrLoadTornadoStats(): TornadoCashProtocolStats {
  const id = "tornado-protocol-stats";
  let stats = TornadoCashProtocolStats.load(id);

  if (stats == null) {
    stats = new TornadoCashProtocolStats(id);

    stats.totalTxCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    const shield = new TornadoCashOperationStats("tornado-shield");
    const unshield = new TornadoCashOperationStats("tornado-unshield");

    shield.totalCount = BigInt.fromI32(0);
    shield.totalGasUsed = BigInt.fromI32(0);
    shield.totalValue = BigInt.fromI32(0);

    unshield.totalCount = BigInt.fromI32(0);
    unshield.totalGasUsed = BigInt.fromI32(0);
    unshield.totalValue = BigInt.fromI32(0);

    shield.save();
    unshield.save();

    stats.shield = shield.id;
    stats.unshield = unshield.id;

    stats.save();
  }

  return stats;
}

export function handleDeposit(event: Deposit): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;

  const instanceId = event.address.toHex();
  const instance = TornadoCashInstance.load(instanceId);

  if (instance == null) {
    return;
  }

  const deposit = new TornadoCashDeposit(id);

  deposit.amount = event.transaction.value;
  deposit.instance = instanceId;

  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.txHash = event.transaction.hash;
  deposit.gasPrice = event.transaction.gasPrice;

  if (event.receipt !== null) {
    deposit.gasUsed = event.receipt!.gasUsed;
  } else {
    deposit.gasUsed = BigInt.fromI32(0);
  }

  deposit.save();

  const stats = createOrLoadTornadoStats();
  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  stats.save();

  const shieldedStats = TornadoCashOperationStats.load(stats.shield);

  if (shieldedStats != null) {
    shieldedStats.totalCount = shieldedStats.totalCount.plus(BigInt.fromI32(1));
    shieldedStats.totalValue = shieldedStats.totalValue.plus(event.transaction.value);

    if (event.receipt !== null) {
      shieldedStats.totalGasUsed = shieldedStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    shieldedStats.save();
  }
}

export function handleWithdrawal(event: Withdrawal): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;

  const instanceId = event.address.toHex();
  const instance = TornadoCashInstance.load(instanceId);

  if (instance == null) {
    return;
  }

  const contract = TornadoInstance.bind(event.address);
  const denomination = contract.denomination();

  const withdrawal = new TornadoCashWithdrawal(id);

  withdrawal.instance = instanceId;
  withdrawal.fee = event.params.fee;
  withdrawal.amount = denomination;

  withdrawal.blockNumber = event.block.number;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.txHash = event.transaction.hash;
  withdrawal.gasPrice = event.transaction.gasPrice;

  if (event.receipt !== null) {
    withdrawal.gasUsed = event.receipt!.gasUsed;
  } else {
    withdrawal.gasUsed = BigInt.fromI32(0);
  }

  withdrawal.save();

  const stats = createOrLoadTornadoStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  stats.save();

  const unshieldedStats = TornadoCashOperationStats.load(stats.unshield);

  if (unshieldedStats != null) {
    unshieldedStats.totalCount = unshieldedStats.totalCount.plus(BigInt.fromI32(1));
    unshieldedStats.totalValue = unshieldedStats.totalValue.plus(event.transaction.value);

    if (event.receipt !== null) {
      unshieldedStats.totalGasUsed = unshieldedStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    unshieldedStats.save();
  }
}
