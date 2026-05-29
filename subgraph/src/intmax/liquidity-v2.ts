import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Deposited, LiquidityV2 } from "../../generated/LiquidityV2/LiquidityV2";
import {
  IntmaxMainnetDeposit,
  IntmaxMainnetDepositStats,
  IntmaxMainnetOperationStats,
  IntmaxMainnetProtocolStats,
} from "../../generated/schema";

function createOrLoadProtocolStats(): IntmaxMainnetProtocolStats {
  const id = "intmax-protocol-stats";
  let stats = IntmaxMainnetProtocolStats.load(id);

  if (stats === null) {
    stats = new IntmaxMainnetProtocolStats(id);

    stats.totalTxCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();

    const depositStats = new IntmaxMainnetOperationStats(`${id}-deposit`);
    stats.deposit = depositStats.id;
    depositStats.totalCount = BigInt.zero();
    depositStats.totalGasUsed = BigInt.zero();

    stats.save();
    depositStats.save();
  }

  return stats;
}

function createOrLoadDepositStats(
  tokenAddress: Address,
  tokenIndex: BigInt,
  operationStatsId: string,
): IntmaxMainnetDepositStats {
  const isNativeETH = tokenAddress.equals(Address.zero());
  const id = isNativeETH ? "intmax-deposit-native-eth" : `intmax-deposit-${tokenAddress.toHexString()}`;

  let stats = IntmaxMainnetDepositStats.load(id);

  if (stats === null) {
    stats = new IntmaxMainnetDepositStats(id);

    stats.operationStats = operationStatsId;
    stats.tokenIndex = tokenIndex;
    stats.tokenAddress = tokenAddress;
    stats.totalCount = BigInt.zero();
    stats.totalGasUsed = BigInt.zero();
    stats.totalValue = BigInt.zero();

    stats.save();
  }

  return stats;
}

export function handleDeposit(event: Deposited): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;

  const deposit = new IntmaxMainnetDeposit(id);
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  const depositStats = IntmaxMainnetOperationStats.load(stats.deposit);

  if (depositStats !== null) {
    depositStats.totalCount = depositStats.totalCount.plus(BigInt.fromI32(1));

    if (event.receipt !== null) {
      depositStats.totalGasUsed = depositStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    depositStats.save();
  }

  stats.save();

  const contract = LiquidityV2.bind(event.address);
  const tokenInfo = contract.getTokenInfo(event.params.tokenIndex);
  const tokenAddress = Address.fromBytes(tokenInfo.tokenAddress);

  deposit.tokenIndex = event.params.tokenIndex;
  deposit.tokenAddress = tokenAddress;
  deposit.amount = event.params.amount;

  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    deposit.gasUsed = event.receipt!.gasUsed;
  }

  deposit.gasPrice = event.transaction.gasPrice;

  if (depositStats !== null) {
    const tokenStats = createOrLoadDepositStats(tokenAddress, event.params.tokenIndex, depositStats.id);

    tokenStats.operationStats = depositStats.id;
    tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));
    tokenStats.totalValue = tokenStats.totalValue.plus(event.params.amount);

    if (event.receipt !== null) {
      tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    tokenStats.save();
  }

  deposit.save();
}
