/* eslint-disable no-underscore-dangle */
import { BigInt, Bytes, store } from "@graphprotocol/graph-ts";

import {
  Deposited,
  PoolRegistered,
  PoolRemoved,
  WithdrawalRelayed,
} from "../../generated/PrivacyPoolsEntrypointProxy/PrivacyPoolsEntrypointProxy";
import {
  PrivacyPoolsProtocolStats,
  PrivacyPoolsOperationStats,
  PrivacyPoolsShieldStats,
  PrivacyPoolsUnshieldStats,
  PrivacyPoolsDeposit,
  PrivacyPoolsWithdrawal,
  PrivacyPoolsPool,
} from "../../generated/schema";

function createOrLoadProtocolStats(): PrivacyPoolsProtocolStats {
  const id = "privacy-pools-protocol-stats";
  let stats = PrivacyPoolsProtocolStats.load(id);

  if (stats == null) {
    stats = new PrivacyPoolsProtocolStats(id);
    stats.totalTxCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    const shieldStats = new PrivacyPoolsOperationStats(`${id}-shield`);
    shieldStats.totalCount = BigInt.fromI32(0);
    shieldStats.totalGasUsed = BigInt.fromI32(0);
    shieldStats.totalValue = BigInt.fromI32(0);

    const unshieldStats = new PrivacyPoolsOperationStats(`${id}-unshield`);
    unshieldStats.totalCount = BigInt.fromI32(0);
    unshieldStats.totalGasUsed = BigInt.fromI32(0);
    unshieldStats.totalValue = BigInt.fromI32(0);

    stats.shield = shieldStats.id;
    stats.unshield = unshieldStats.id;

    stats.save();
    shieldStats.save();
    unshieldStats.save();
  }

  return stats;
}

function createOrLoadShieldStats(tokenAddress: Bytes, operationStatsId: string): PrivacyPoolsShieldStats {
  const id = `privacy-pools-shield-${tokenAddress.toHex()}`;
  let stats = PrivacyPoolsShieldStats.load(id);

  if (stats == null) {
    stats = new PrivacyPoolsShieldStats(id);
    stats.tokenAddress = tokenAddress;
    stats.operationStats = operationStatsId;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);
    stats.totalValue = BigInt.fromI32(0);
    stats.save();
  }

  return stats;
}

function createOrLoadUnshieldStats(tokenAddress: Bytes, operationStatsId: string): PrivacyPoolsUnshieldStats {
  const id = `privacy-pools-unshield-${tokenAddress.toHex()}`;
  let stats = PrivacyPoolsUnshieldStats.load(id);

  if (stats == null) {
    stats = new PrivacyPoolsUnshieldStats(id);
    stats.tokenAddress = tokenAddress;
    stats.operationStats = operationStatsId;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);
    stats.totalValue = BigInt.fromI32(0);
    stats.save();
  }

  return stats;
}

export function handlePoolRegistered(event: PoolRegistered): void {
  const id = event.params._pool.toHex();

  const entity = new PrivacyPoolsPool(id);
  entity.pool = event.params._pool;
  entity.asset = event.params._asset;

  entity.save();
}

export function handlePoolRemoved(event: PoolRemoved): void {
  const id = event.params._pool.toHex();

  const entity = PrivacyPoolsPool.load(id);

  if (entity !== null) {
    store.remove("PrivacyPoolsPool", id);
  }
}

export function handleDeposit(event: Deposited): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;

  const deposit = new PrivacyPoolsDeposit(id);
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  const shieldStats = PrivacyPoolsOperationStats.load(stats.shield);

  if (shieldStats !== null) {
    shieldStats.totalCount = shieldStats.totalCount.plus(BigInt.fromI32(1));
    shieldStats.totalValue = shieldStats.totalValue.plus(event.params._amount);

    if (event.receipt !== null) {
      shieldStats.totalGasUsed = shieldStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    shieldStats.save();
  }

  stats.save();

  const pool = PrivacyPoolsPool.load(event.params._pool.toHex());

  if (pool === null) {
    return;
  }

  deposit.tokenAddress = pool.asset;
  deposit.amount = event.params._amount;

  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    deposit.gasUsed = event.receipt!.gasUsed;
  }

  deposit.gasPrice = event.transaction.gasPrice;

  if (shieldStats !== null) {
    const tokenStats = createOrLoadShieldStats(event.params._pool, shieldStats.id);

    tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));
    tokenStats.totalValue = tokenStats.totalValue.plus(event.params._amount);

    if (event.receipt !== null) {
      tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    tokenStats.save();
  }

  deposit.save();
}

export function handleWithdrawal(event: WithdrawalRelayed): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;

  const withdrawal = new PrivacyPoolsWithdrawal(id);
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  const unshieldStats = PrivacyPoolsOperationStats.load(stats.unshield);

  if (unshieldStats !== null) {
    unshieldStats.totalCount = unshieldStats.totalCount.plus(BigInt.fromI32(1));
    unshieldStats.totalValue = unshieldStats.totalValue.plus(event.params._amount);

    if (event.receipt !== null) {
      unshieldStats.totalGasUsed = unshieldStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    unshieldStats.save();
  }

  stats.save();

  withdrawal.tokenAddress = event.params._asset;
  withdrawal.amount = event.params._amount;
  withdrawal.fee = event.params._feeAmount;

  withdrawal.blockNumber = event.block.number;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    withdrawal.gasUsed = event.receipt!.gasUsed;
  }

  withdrawal.gasPrice = event.transaction.gasPrice;

  if (unshieldStats !== null) {
    const tokenStats = createOrLoadUnshieldStats(event.params._asset, unshieldStats.id);

    tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));
    tokenStats.totalValue = tokenStats.totalValue.plus(event.params._amount);

    if (event.receipt !== null) {
      tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    tokenStats.save();
  }

  withdrawal.save();
}
