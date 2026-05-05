import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import { HinkalTransferLog } from "../../generated/schema";

export const TRANSFER_TOPIC = Bytes.fromHexString("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
export const NEW_COMMITMENT_TOPIC = Bytes.fromHexString(
  "0xc2e3bd2d00c3cf4d09298e5a0cfd317cf7a6e5bf15d467cfa805a91e1a4a221d",
);
export const NULLIFIED_TOPIC = Bytes.fromHexString(
  "0xda5c236f484b8df30f1352feea0a68beb5b0981b991061fdc8cdf3ce135c08fe",
);

export enum Operations {
  UNSHIELD_ERC20,
  SHIELD_ERC20,
  INTERNAL_TRANSFER,
  SHIELD_NATIVE,
  UNSHIELD_NATIVE,
  UNKNOWN,
}

export function getOperationFromLogs(logs: ethereum.Log[]): Operations {
  const events = extractEvents(logs);

  const isUnshieldERC20 = events.includes("TRANSFER") && events.includes("NULLIFIED") && !events.includes("COMMITMENT");
  const isShieldERC20 = events.includes("TRANSFER") && events.includes("COMMITMENT") && !events.includes("NULLIFIED");
  const isInternalTransfer =
    events.includes("COMMITMENT") && events.includes("NULLIFIED") && !events.includes("TRANSFER");
  const isShieldNative = events.includes("COMMITMENT") && !events.includes("NULLIFIED") && !events.includes("TRANSFER");
  const isUnshieldNative =
    !events.includes("COMMITMENT") && events.includes("NULLIFIED") && !events.includes("TRANSFER");

  if (isUnshieldERC20) {
    return Operations.UNSHIELD_ERC20;
  }

  if (isShieldERC20) {
    return Operations.SHIELD_ERC20;
  }

  if (isInternalTransfer) {
    return Operations.INTERNAL_TRANSFER;
  }

  if (isShieldNative) {
    return Operations.SHIELD_NATIVE;
  }

  if (isUnshieldNative) {
    return Operations.UNSHIELD_NATIVE;
  }

  return Operations.UNKNOWN;
}

export function extractEvents(logs: ethereum.Log[]): string[] {
  const events: string[] = [];

  for (let i = 0; i < logs.length; i += 1) {
    const log = logs[i];

    if (log.topics.length > 0) {
      if (log.topics[0].equals(NEW_COMMITMENT_TOPIC)) {
        events.push("COMMITMENT");
      }

      if (log.topics[0].equals(NULLIFIED_TOPIC)) {
        events.push("NULLIFIED");
      }

      if (log.topics[0].equals(TRANSFER_TOPIC)) {
        events.push("TRANSFER");
      }
    }
  }

  return events;
}

export function parseTransferEvent(event: ethereum.Event, log: ethereum.Log, index: BigInt): HinkalTransferLog | null {
  if (log.topics.length < 3 || !log.topics[0].equals(TRANSFER_TOPIC)) {
    return null;
  }

  const id = event.transaction.hash.concatI32(event.logIndex.toI32()).concatI32(index.toI32());
  const hinkalLog = new HinkalTransferLog(id);

  const from = Address.fromBytes(Bytes.fromUint8Array(log.topics[1].slice(12)));
  const to = Address.fromBytes(Bytes.fromUint8Array(log.topics[2].slice(12)));
  let amount = BigInt.zero();

  if (log.data.length >= 32) {
    const decoded = ethereum.decode("uint256", log.data);

    if (decoded) {
      amount = decoded.toBigInt();
    }
  }

  hinkalLog.amount = amount;
  hinkalLog.from = from;
  hinkalLog.to = to;
  hinkalLog.address = log.address;

  return hinkalLog;
}
