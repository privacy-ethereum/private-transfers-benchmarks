import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import { Shield as ShieldEvent, Unshield as UnshieldEvent } from "../generated/RailgunSmartWallet/RailgunSmartWallet";
import {
  RailgunShield,
  RailgunCommitment,
  RailgunShieldCiphertext,
  RailgunProtocolStats,
  RailgunOperationStats,
  RailgunShieldTokenStats,
  RailgunUnshieldTokenStats,
  RailgunUnshield,
} from "../generated/schema";

function createOrLoadProtocolStats(): RailgunProtocolStats {
  const id = "railgun-protocol-stats";
  let stats = RailgunProtocolStats.load(id);

  if (stats == null) {
    stats = new RailgunProtocolStats(id);
    stats.totalTxCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);

    const shieldStats = new RailgunOperationStats(`${id}-shield`);
    const unshieldStats = new RailgunOperationStats(`${id}-unshield`);

    stats.shield = shieldStats.id;
    shieldStats.totalCount = BigInt.fromI32(0);
    shieldStats.totalGasUsed = BigInt.fromI32(0);

    stats.unshield = unshieldStats.id;
    unshieldStats.totalCount = BigInt.fromI32(0);
    unshieldStats.totalGasUsed = BigInt.fromI32(0);

    stats.save();
    shieldStats.save();
    unshieldStats.save();
  }

  return stats;
}

function createOrLoadShieldTokenStats(tokenAddress: Bytes, operationStatsId: string): RailgunShieldTokenStats {
  const id = tokenAddress.toHex();
  let stats = RailgunShieldTokenStats.load(id);

  if (stats == null) {
    stats = new RailgunShieldTokenStats(id);
    stats.operationStats = operationStatsId;
    stats.tokenAddress = tokenAddress;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);
    stats.totalValue = BigInt.fromI32(0);

    stats.save();
  }

  return stats;
}

function createOrLoadUnshieldTokenStats(tokenAddress: Bytes, operationStatsId: string): RailgunUnshieldTokenStats {
  const id = tokenAddress.toHex();
  let stats = RailgunUnshieldTokenStats.load(id);

  if (stats == null) {
    stats = new RailgunUnshieldTokenStats(id);
    stats.operationStats = operationStatsId;
    stats.tokenAddress = tokenAddress;
    stats.totalCount = BigInt.fromI32(0);
    stats.totalGasUsed = BigInt.fromI32(0);
    stats.totalValue = BigInt.fromI32(0);

    stats.save();
  }

  return stats;
}

export function handleShield(event: ShieldEvent): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;

  const shield = new RailgunShield(id);
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  const shieldStats = RailgunOperationStats.load(stats.shield);

  if (shieldStats !== null) {
    shieldStats.totalCount = shieldStats.totalCount.plus(BigInt.fromI32(1));

    if (event.receipt !== null) {
      shieldStats.totalGasUsed = shieldStats.totalGasUsed.plus(event.receipt!.gasUsed);
    } else {
      shieldStats.totalGasUsed = shieldStats.totalGasUsed.plus(BigInt.fromI32(0));
    }

    shieldStats.save();
  }

  stats.save();

  shield.treeNumber = event.params.treeNumber;
  shield.startPosition = event.params.startPosition;
  shield.fees = event.params.fees;

  shield.blockNumber = event.block.number;
  shield.timestamp = event.block.timestamp;
  shield.txHash = event.transaction.hash;
  if (event.receipt !== null) {
    shield.gasUsed = event.receipt!.gasUsed;
  }
  shield.gasPrice = event.transaction.gasPrice;

  for (let index = 0; index < event.params.commitments.length; index += 1) {
    const commitmentId = `${id}-c-${index.toString()}`;
    const eventCommitment = event.params.commitments[index];
    const commitment = new RailgunCommitment(commitmentId);

    commitment.shield = id;

    commitment.npk = eventCommitment.npk;

    commitment.tokenType = eventCommitment.token.tokenType;
    commitment.tokenAddress = eventCommitment.token.tokenAddress;
    commitment.tokenSubID = eventCommitment.token.tokenSubID;

    commitment.value = eventCommitment.value;

    if (shieldStats !== null) {
      const tokenStats = createOrLoadShieldTokenStats(eventCommitment.token.tokenAddress, shieldStats.id);

      if (event.receipt !== null) {
        const gasPerCommitment = event.receipt!.gasUsed.div(BigInt.fromI32(event.params.commitments.length));
        tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(gasPerCommitment);
      }

      tokenStats.operationStats = shieldStats.id;
      tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));
      tokenStats.totalValue = tokenStats.totalValue.plus(eventCommitment.value);

      tokenStats.save();
    }

    commitment.save();
  }

  const ciphertexts = event.params.shieldCiphertext;

  for (let index = 0; index < ciphertexts.length; index += 1) {
    const ctId = `${id}-ct-${index.toString()}`;
    const cipher = new RailgunShieldCiphertext(ctId);

    cipher.shield = id;

    const bundle = ciphertexts[index].encryptedBundle;
    cipher.encryptedBundle0 = bundle[0];
    cipher.encryptedBundle1 = bundle[1];
    cipher.encryptedBundle2 = bundle[2];

    cipher.shieldKey = ciphertexts[index].shieldKey;

    cipher.save();
  }

  shield.save();
}

export function handleUnshield(event: UnshieldEvent): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;

  const unshield = new RailgunUnshield(id);
  const stats = createOrLoadProtocolStats();

  stats.totalTxCount = stats.totalTxCount.plus(BigInt.fromI32(1));

  if (event.receipt !== null) {
    stats.totalGasUsed = stats.totalGasUsed.plus(event.receipt!.gasUsed);
  }

  const unshieldStats = RailgunOperationStats.load(stats.unshield);

  if (unshieldStats !== null) {
    unshieldStats.totalCount = unshieldStats.totalCount.plus(BigInt.fromI32(1));

    if (event.receipt !== null) {
      unshieldStats.totalGasUsed = unshieldStats.totalGasUsed.plus(event.receipt!.gasUsed);
    } else {
      unshieldStats.totalGasUsed = unshieldStats.totalGasUsed.plus(BigInt.fromI32(0));
    }

    unshieldStats.save();
  }

  stats.save();

  unshield.amount = event.params.amount;
  unshield.fee = event.params.fee;

  unshield.to = event.params.to;
  unshield.tokenType = event.params.token.tokenType;
  unshield.tokenAddress = event.params.token.tokenAddress;
  unshield.tokenSubID = event.params.token.tokenSubID;

  unshield.blockNumber = event.block.number;
  unshield.timestamp = event.block.timestamp;
  unshield.txHash = event.transaction.hash;

  if (event.receipt !== null) {
    unshield.gasUsed = event.receipt!.gasUsed;
  }

  unshield.gasPrice = event.transaction.gasPrice;

  if (unshieldStats !== null) {
    const tokenStats = createOrLoadUnshieldTokenStats(event.params.token.tokenAddress, unshieldStats.id);

    tokenStats.operationStats = unshieldStats.id;
    tokenStats.totalCount = tokenStats.totalCount.plus(BigInt.fromI32(1));

    if (event.receipt !== null) {
      tokenStats.totalGasUsed = tokenStats.totalGasUsed.plus(event.receipt!.gasUsed);
    }

    tokenStats.totalValue = tokenStats.totalValue.plus(event.params.amount);

    tokenStats.save();
  }

  unshield.save();
}
