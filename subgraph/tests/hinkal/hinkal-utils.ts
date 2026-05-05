import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { NewCommitment, Nullified } from "../../generated/HinkalPool/HinkalPool";
import { NEW_COMMITMENT_TOPIC, NULLIFIED_TOPIC, TRANSFER_TOPIC } from "../../src/hinkal/utils";

export function createTransferLog(token: Address, from: Address, to: Address, amount: BigInt): ethereum.Log {
  const log = changetype<ethereum.Log>(newMockEvent());

  log.address = token;

  log.topics = [TRANSFER_TOPIC, addressToTopic(from), addressToTopic(to)];

  log.data = ethereum.encode(ethereum.Value.fromUnsignedBigInt(amount))!;

  return log;
}

function addressToTopic(address: Address): Bytes {
  const padded = new Uint8Array(32);
  const bytes = address as Bytes;

  for (let index = 0; index < 20; index += 1) {
    padded[12 + index] = bytes[index];
  }

  return Bytes.fromUint8Array(padded);
}

export function createNewCommitmentEvent(transferLog: ethereum.Log): NewCommitment {
  const event = changetype<NewCommitment>(newMockEvent());

  const commitmentLog = changetype<ethereum.Log>(newMockEvent());
  commitmentLog.topics = [NEW_COMMITMENT_TOPIC];
  commitmentLog.data = Bytes.empty();

  const receipt = changetype<ethereum.TransactionReceipt>(newMockEvent());
  receipt.logs = [transferLog, commitmentLog];
  receipt.gasUsed = BigInt.fromI32(1);

  event.receipt = receipt;

  return event;
}

export function createNullifiedEvent(logs: ethereum.Log[]): Nullified {
  const event = changetype<Nullified>(newMockEvent());

  const nullifiedLog = changetype<ethereum.Log>(newMockEvent());
  nullifiedLog.topics = [NULLIFIED_TOPIC];
  nullifiedLog.data = Bytes.empty();

  const receipt = changetype<ethereum.TransactionReceipt>(newMockEvent());
  receipt.logs = [logs[0], logs[1], nullifiedLog];
  receipt.gasUsed = BigInt.fromI32(1);

  event.receipt = receipt;

  return event;
}

export function createShieldNativeEvent(): NewCommitment {
  const event = changetype<NewCommitment>(newMockEvent());

  const commitmentLog = changetype<ethereum.Log>(newMockEvent());
  commitmentLog.topics = [NEW_COMMITMENT_TOPIC];
  commitmentLog.data = Bytes.empty();

  const receipt = changetype<ethereum.TransactionReceipt>(newMockEvent());
  receipt.logs = [commitmentLog];
  receipt.gasUsed = BigInt.fromI32(1);

  event.receipt = receipt;

  return event;
}

export function createUnshieldNativeEvent(): Nullified {
  const event = changetype<Nullified>(newMockEvent());

  const nullifiedLog = changetype<ethereum.Log>(newMockEvent());
  nullifiedLog.topics = [NULLIFIED_TOPIC];
  nullifiedLog.data = Bytes.empty();

  const receipt = changetype<ethereum.TransactionReceipt>(newMockEvent());
  receipt.logs = [nullifiedLog];
  receipt.gasUsed = BigInt.fromI32(1);

  event.receipt = receipt;

  return event;
}
