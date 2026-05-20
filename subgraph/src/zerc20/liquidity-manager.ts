import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  Wrapped as WrappedEvent,
  Unwrapped as UnwrappedEvent,
} from "../../generated/LiquidityManager/LiquidityManager";
import {
  ZERC20OperationStats,
  ZERC20ProtocolStats,
  ZERC20Unwrap,
  ZERC20UnwrappedStats,
  ZERC20Wrap,
  ZERC20WrappedStats,
} from "../../generated/schema";

export function createOrLoadProtocolStats(): ZERC20ProtocolStats {
  const id = "zerc20-protocol-stats";
  let stats = ZERC20ProtocolStats.load(id);

  if (stats == null) {
    stats = new ZERC20ProtocolStats(id);
    stats.totalTxCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();

    const wrapStats = new ZERC20OperationStats(`${id}-wrap-native-eth`);
    const unwrapStats = new ZERC20OperationStats(`${id}-unwrap-native-eth`);
    const teleportStats = new ZERC20OperationStats(`${id}-teleport-native-eth`);

    stats.wrap = wrapStats.id;
    stats.unwrap = unwrapStats.id;
    stats.teleport = teleportStats.id;

    wrapStats.totalCount = BigInt.zero();
    wrapStats.totalGasUsed = BigInt.zero();
    wrapStats.totalValue = BigInt.zero();

    unwrapStats.totalCount = BigInt.zero();
    unwrapStats.totalGasUsed = BigInt.zero();
    unwrapStats.totalValue = BigInt.zero();

    teleportStats.totalCount = BigInt.zero();
    teleportStats.totalGasUsed = BigInt.zero();
    teleportStats.totalValue = BigInt.zero();

    wrapStats.save();
    unwrapStats.save();
    teleportStats.save();
    stats.save();
  }

  return stats;
}

export function saveProtocolStats(event: ethereum.Event): void {
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  stats.save();
}

function createOrLoadWrapStats(tokenAddress: Bytes | null, operationStatsId: string): ZERC20WrappedStats {
  const id = tokenAddress === null ? "zerc20-wrap-native-eth" : tokenAddress.toHex();
  let stats = ZERC20WrappedStats.load(id);

  if (stats == null) {
    stats = new ZERC20WrappedStats(id);
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();
    stats.operationStats = operationStatsId;

    if (tokenAddress !== null) {
      stats.tokenAddress = tokenAddress;
    }

    stats.save();
  }

  return stats;
}

function createOrLoadUnwrapStats(tokenAddress: Bytes | null, operationStatsId: string): ZERC20UnwrappedStats {
  const id = tokenAddress === null ? "zerc20-unwrap-native-eth" : tokenAddress.toHex();
  let stats = ZERC20UnwrappedStats.load(id);

  if (stats == null) {
    stats = new ZERC20UnwrappedStats(id);
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();
    stats.operationStats = operationStatsId;

    if (tokenAddress !== null) {
      stats.tokenAddress = tokenAddress;
    }

    stats.save();
  }

  return stats;
}

export function saveOperationStats(operationId: string, event: ethereum.Event, value: BigInt): void {
  const operationStats = ZERC20OperationStats.load(operationId);

  if (operationStats !== null) {
    operationStats.totalCount = operationStats.totalCount.plus(BigInt.fromI32(1));
    operationStats.totalValue = operationStats.totalValue.plus(value);

    if (event.receipt !== null) {
      operationStats.totalGasUsed = operationStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    operationStats.save();
  }
}

export function handleWrapped(event: WrappedEvent): void {
  const stats = createOrLoadProtocolStats();
  const operationId = stats.wrap;
  const wrappedValue = event.transaction.value;

  saveProtocolStats(event);
  saveOperationStats(operationId, event, wrappedValue);

  const wrapStats = createOrLoadWrapStats(null, operationId);

  if (event.receipt !== null) {
    wrapStats.totalGasUsed = wrapStats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  wrapStats.operationStats = operationId;
  wrapStats.totalCount = wrapStats.totalCount.plus(BigInt.fromI32(1));
  wrapStats.totalValue = wrapStats.totalValue.plus(wrappedValue);

  wrapStats.save();

  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const wrap = new ZERC20Wrap(id);

  wrap.value = wrappedValue;
  wrap.blockNumber = event.block.number;
  wrap.timestamp = event.block.timestamp;
  wrap.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    wrap.gasUsed = event.receipt!.gasUsed;
  }

  wrap.gasPrice = event.transaction.gasPrice;

  wrap.save();
}

export function handleUnwrapped(event: UnwrappedEvent): void {
  const stats = createOrLoadProtocolStats();
  const operationId = stats.unwrap;
  const unwrappedValue = event.params.amountOut;

  saveProtocolStats(event);
  saveOperationStats(operationId, event, unwrappedValue);

  const unwrapStats = createOrLoadUnwrapStats(null, operationId);

  if (event.receipt !== null) {
    unwrapStats.totalGasUsed = unwrapStats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  unwrapStats.operationStats = operationId;
  unwrapStats.totalCount = unwrapStats.totalCount.plus(BigInt.fromI32(1));
  unwrapStats.totalValue = unwrapStats.totalValue.plus(unwrappedValue);

  unwrapStats.save();

  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const unwrap = new ZERC20Unwrap(id);

  unwrap.value = unwrappedValue;
  unwrap.blockNumber = event.block.number;
  unwrap.timestamp = event.block.timestamp;
  unwrap.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    unwrap.gasUsed = event.receipt!.gasUsed;
  }

  unwrap.gasPrice = event.transaction.gasPrice;

  unwrap.save();
}
