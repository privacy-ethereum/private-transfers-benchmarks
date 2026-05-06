import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import { NewCommitment, Nullified } from "../../generated/HinkalPool/HinkalPool";
import {
  HinkalProtocolStats,
  HinkalOperationStats,
  HinkalShieldERC20TokenStats,
  HinkalUnshieldERC20TokenStats,
  HinkalTransactTokenStats,
  HinkalUnshieldNativeTokenStats,
  HinkalShieldNativeTokenStats,
  HinkalShieldNative,
  HinkalUnshieldNative,
  HinkalUnshieldERC20,
  HinkalShieldERC20,
  HinkalTransact,
} from "../../generated/schema";

import { getOperationFromLogs, Operations, parseTransferEvent } from "./utils";

function createOrLoadProtocolStats(): HinkalProtocolStats {
  const id = "hinkal-protocol-stats";
  let stats = HinkalProtocolStats.load(id);

  if (stats == null) {
    stats = new HinkalProtocolStats(id);

    stats.totalTxCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();

    const shieldERC20 = new HinkalOperationStats(`${id}-shield-erc20`);
    const unshieldERC20 = new HinkalOperationStats(`${id}-unshield-erc20`);
    const shieldNative = new HinkalOperationStats(`${id}-shield-native`);
    const unshieldNative = new HinkalOperationStats(`${id}-unshield-native`);
    const transact = new HinkalOperationStats(`${id}-transact`);

    shieldERC20.totalCount = BigInt.zero();
    shieldERC20.totalGasUsed = BigInt.zero();

    unshieldERC20.totalCount = BigInt.zero();
    unshieldERC20.totalGasUsed = BigInt.zero();

    shieldNative.totalCount = BigInt.zero();
    shieldNative.totalGasUsed = BigInt.zero();

    unshieldNative.totalCount = BigInt.zero();
    unshieldNative.totalGasUsed = BigInt.zero();

    transact.totalCount = BigInt.zero();
    transact.totalGasUsed = BigInt.zero();

    stats.shieldERC20 = shieldERC20.id;
    stats.unshieldERC20 = unshieldERC20.id;
    stats.shieldNative = shieldNative.id;
    stats.unshieldNative = unshieldNative.id;
    stats.transact = transact.id;

    stats.save();
    shieldERC20.save();
    unshieldERC20.save();
    shieldNative.save();
    unshieldNative.save();
    transact.save();
  }

  return stats;
}

function createOrLoadShieldERC20TokenStats(tokenAddress: Bytes, operationStatsId: string): HinkalShieldERC20TokenStats {
  const id = `hinkal-shield-${tokenAddress.toHex()}`;
  let stats = HinkalShieldERC20TokenStats.load(id);

  if (stats == null) {
    stats = new HinkalShieldERC20TokenStats(id);
    stats.operationStats = operationStatsId;
    stats.tokenAddress = tokenAddress;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);
    stats.totalValue = BigInt.fromI32(0);

    stats.save();
  }

  return stats;
}

function createOrLoadShieldNativeTokenStats(operationStatsId: string): HinkalShieldNativeTokenStats {
  const id = "hinkal-protocol-stats-shield-native-stats";
  let stats = HinkalShieldNativeTokenStats.load(id);

  if (stats == null) {
    stats = new HinkalShieldNativeTokenStats(id);
    stats.operationStats = operationStatsId;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    stats.save();
  }

  return stats;
}

function createOrLoadTransactTokenStats(operationStatsId: string): HinkalTransactTokenStats {
  const id = "hinkal-protocol-stats-transact-stats";
  let stats = HinkalTransactTokenStats.load(id);

  if (stats == null) {
    stats = new HinkalTransactTokenStats(id);
    stats.operationStats = operationStatsId;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    stats.save();
  }

  return stats;
}

function createOrLoadUnshieldERC20TokenStats(
  tokenAddress: Bytes,
  operationStatsId: string,
): HinkalUnshieldERC20TokenStats {
  const id = `hinkal-unshield-${tokenAddress.toHex()}`;
  let stats = HinkalUnshieldERC20TokenStats.load(id);

  if (stats == null) {
    stats = new HinkalUnshieldERC20TokenStats(id);
    stats.operationStats = operationStatsId;
    stats.tokenAddress = tokenAddress;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);
    stats.totalValue = BigInt.fromI32(0);

    stats.save();
  }

  return stats;
}

function createOrLoadUnshieldNativeTokenStats(operationStatsId: string): HinkalUnshieldNativeTokenStats {
  const id = "hinkal-protocol-stats-unshield-native-stats";
  let stats = HinkalUnshieldNativeTokenStats.load(id);

  if (stats == null) {
    stats = new HinkalUnshieldNativeTokenStats(id);
    stats.operationStats = operationStatsId;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    stats.save();
  }

  return stats;
}

export function handleNewCommitment(event: NewCommitment): void {
  if (event.receipt === null) {
    return;
  }

  const logs = event.receipt!.logs;
  const operation = getOperationFromLogs(logs);

  if (![Operations.SHIELD_ERC20, Operations.INTERNAL_TRANSFER, Operations.SHIELD_NATIVE].includes(operation)) {
    return;
  }

  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));
  stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);

  switch (operation) {
    case Operations.SHIELD_ERC20: {
      const shield = new HinkalShieldERC20(event.transaction.hash.toHex());
      const shieldStats = HinkalOperationStats.load(stats.shieldERC20);
      const transferLog = parseTransferEvent(event, logs[0], BigInt.fromI32(0));

      if (transferLog === null) {
        return;
      }

      shield.value = transferLog.amount;
      shield.tokenAddress = transferLog.address;
      shield.blockNumber = event.block.number;
      shield.timestamp = event.block.timestamp;
      shield.txHash = event.transaction.hash;
      shield.gasUsed = event.receipt!.gasUsed;
      shield.gasPrice = event.transaction.gasPrice;
      shield.save();

      if (shieldStats !== null) {
        shieldStats.totalCount = shieldStats.totalCount.plus(BigInt.fromI32(1));
        shieldStats.totalGasUsed = shieldStats.totalGasUsed.plus(event.receipt!.gasUsed);

        const tokenStats = createOrLoadShieldERC20TokenStats(transferLog.address, shieldStats.id);

        tokenStats.operationStats = shieldStats.id;
        tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));
        tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(event.receipt!.gasUsed);
        tokenStats.totalValue = tokenStats.totalValue.plus(transferLog.amount);

        tokenStats.save();
        shieldStats.save();
      }
      break;
    }
    case Operations.INTERNAL_TRANSFER: {
      const transact = new HinkalTransact(event.transaction.hash.toHex());
      const transactStats = HinkalOperationStats.load(stats.transact);

      // TODO: Not possible to get transaction value without decoding input manually
      transact.blockNumber = event.block.number;
      transact.timestamp = event.block.timestamp;
      transact.txHash = event.transaction.hash;
      transact.gasUsed = event.receipt!.gasUsed;
      transact.gasPrice = event.transaction.gasPrice;
      transact.save();

      if (transactStats !== null) {
        transactStats.totalCount = transactStats.totalCount.plus(BigInt.fromI32(1));
        transactStats.totalGasUsed = transactStats.totalGasUsed.plus(event.receipt!.gasUsed);

        const tokenStats = createOrLoadTransactTokenStats(transactStats.id);

        tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(event.receipt!.gasUsed);
        tokenStats.operationStats = transactStats.id;
        tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));

        tokenStats.save();
        transactStats.save();
      }
      break;
    }
    case Operations.SHIELD_NATIVE: {
      const shield = new HinkalShieldNative(event.transaction.hash.toHex());
      const shieldNativeStats = HinkalOperationStats.load(stats.shieldNative);

      // TODO: Not possible to get transaction value without decoding input manually
      shield.blockNumber = event.block.number;
      shield.timestamp = event.block.timestamp;
      shield.txHash = event.transaction.hash;
      shield.gasUsed = event.receipt!.gasUsed;
      shield.gasPrice = event.transaction.gasPrice;
      shield.save();

      if (shieldNativeStats !== null) {
        shieldNativeStats.totalCount = shieldNativeStats.totalCount.plus(BigInt.fromI32(1));
        shieldNativeStats.totalGasUsed = shieldNativeStats.totalGasUsed.plus(event.receipt!.gasUsed);

        const tokenStats = createOrLoadShieldNativeTokenStats(shieldNativeStats.id);

        tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(event.receipt!.gasUsed);
        tokenStats.operationStats = shieldNativeStats.id;
        tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));

        tokenStats.save();
        shieldNativeStats.save();
      }
      break;
    }
    default: {
      break;
    }
  }

  stats.save();
}

export function handleNullified(event: Nullified): void {
  if (event.receipt === null) {
    return;
  }

  const logs = event.receipt!.logs;
  const operation = getOperationFromLogs(logs);

  if (![Operations.UNSHIELD_ERC20, Operations.UNSHIELD_NATIVE].includes(operation)) {
    return;
  }

  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));
  stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);

  switch (operation) {
    case Operations.UNSHIELD_ERC20: {
      const unshield = new HinkalUnshieldERC20(event.transaction.hash.toHex());
      const unshieldStats = HinkalOperationStats.load(stats.unshieldERC20);
      const feeLog = parseTransferEvent(event, logs[0], BigInt.fromI32(0));
      const transferLog = parseTransferEvent(event, logs[1], BigInt.fromI32(1));

      if (transferLog === null || feeLog === null) {
        return;
      }

      unshield.fee = feeLog.amount;
      unshield.value = transferLog.amount;
      unshield.tokenAddress = transferLog.address;
      unshield.blockNumber = event.block.number;
      unshield.timestamp = event.block.timestamp;
      unshield.txHash = event.transaction.hash;
      unshield.gasUsed = event.receipt!.gasUsed;
      unshield.gasPrice = event.transaction.gasPrice;
      unshield.save();

      if (unshieldStats !== null) {
        unshieldStats.totalCount = unshieldStats.totalCount.plus(BigInt.fromI32(1));
        unshieldStats.totalGasUsed = unshieldStats.totalGasUsed.plus(event.receipt!.gasUsed);

        const tokenStats = createOrLoadUnshieldERC20TokenStats(transferLog.address, unshieldStats.id);

        tokenStats.operationStats = unshieldStats.id;
        tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));
        tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(event.receipt!.gasUsed);
        tokenStats.totalValue = tokenStats.totalValue.plus(transferLog.amount);

        tokenStats.save();
        unshieldStats.save();
      }
      break;
    }
    case Operations.UNSHIELD_NATIVE: {
      const unshield = new HinkalUnshieldNative(event.transaction.hash.toHex());
      const unshieldStats = HinkalOperationStats.load(stats.unshieldNative);

      // TODO: Not possible to get transaction value without decoding input manually
      unshield.blockNumber = event.block.number;
      unshield.timestamp = event.block.timestamp;
      unshield.txHash = event.transaction.hash;
      unshield.gasUsed = event.receipt!.gasUsed;
      unshield.gasPrice = event.transaction.gasPrice;
      unshield.save();

      if (unshieldStats !== null) {
        unshieldStats.totalCount = unshieldStats.totalCount.plus(BigInt.fromI32(1));
        unshieldStats.totalGasUsed = unshieldStats.totalGasUsed.plus(event.receipt!.gasUsed);

        const tokenStats = createOrLoadUnshieldNativeTokenStats(unshieldStats.id);

        tokenStats.operationStats = unshieldStats.id;
        tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));
        tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(event.receipt!.gasUsed);

        tokenStats.save();
        unshieldStats.save();
      }
      break;
    }
    default: {
      break;
    }
  }

  stats.save();
}
