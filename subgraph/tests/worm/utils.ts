import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Transfer } from "../../generated/BETH/BETH";
import { WETH_MAINNET_CONTRACT, WITHDRAW_TOPIC } from "../../src/worm/utils";

function addressToTopic(address: Address): Bytes {
  const padded = new Uint8Array(32);
  const bytes = address as Bytes;

  for (let index = 0; index < 20; index += 1) {
    padded[12 + index] = bytes[index];
  }

  return Bytes.fromUint8Array(padded);
}

export function createTransferEvent(txHash: Bytes, from: Address, to: Address, value: BigInt): Transfer {
  const event = changetype<Transfer>(newMockEvent());

  event.transaction.hash = txHash;
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value)));

  event.transaction.gasPrice = BigInt.fromI32(1);

  return event;
}

export function createWithdrawLog(src: Address, wad: BigInt): ethereum.Log {
  const log = changetype<ethereum.Log>(newMockEvent());

  log.address = WETH_MAINNET_CONTRACT;
  log.topics = [Bytes.fromUint8Array(WITHDRAW_TOPIC), addressToTopic(src)];
  log.data = Bytes.fromUint8Array(ethereum.encode(ethereum.Value.fromUnsignedBigInt(wad))!);

  return log;
}

export function createTransferEventWithWithdrawLog(
  txHash: Bytes,
  transferFrom: Address,
  transferTo: Address,
  transferValue: BigInt,
  withdrawSrc: Address,
  withdrawWad: BigInt,
): Transfer {
  const event = createTransferEvent(txHash, transferFrom, transferTo, transferValue);

  const receipt = changetype<ethereum.TransactionReceipt>(newMockEvent());
  const log = createWithdrawLog(withdrawSrc, withdrawWad);
  receipt.logs = [log];
  receipt.gasUsed = BigInt.fromI32(1);

  event.receipt = receipt;

  return event;
}

export function createDummyLog(): ethereum.Log {
  const log = changetype<ethereum.Log>(newMockEvent());

  log.address = Address.fromString("0x0000000000000000000000000000000000000000");
  log.topics = [Bytes.fromHexString("0x0000000000000000000000000000000000000000000000000000000000000000")];
  log.data = Bytes.fromHexString("0x");

  return log;
}

export function createTransferEventWithDummyLog(
  txHash: Bytes,
  transferFrom: Address,
  transferTo: Address,
  transferValue: BigInt,
): Transfer {
  const event = createTransferEvent(txHash, transferFrom, transferTo, transferValue);

  const receipt = changetype<ethereum.TransactionReceipt>(newMockEvent());
  const log = createDummyLog();
  receipt.logs = [log];
  receipt.gasUsed = BigInt.fromI32(1);

  event.receipt = receipt;

  return event;
}
