import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Deposit, Withdraw } from "../../generated/Shielder/Shielder";

const CONTRACT_VERSION = Bytes.fromHexString("0x000000");
const MEMO = Bytes.fromHexString("0x00");

export function createDepositEvent(tokenAddress: Address, amount: BigInt): Deposit {
  const event = changetype<Deposit>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("contractVersion", ethereum.Value.fromFixedBytes(CONTRACT_VERSION)));
  event.parameters.push(new ethereum.EventParam("tokenAddress", ethereum.Value.fromAddress(tokenAddress)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("newNote", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("newNoteIndex", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("macSalt", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("macCommitment", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("protocolFee", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("memo", ethereum.Value.fromBytes(MEMO)));

  return event;
}

export function createWithdrawEvent(tokenAddress: Address, amount: BigInt): Withdraw {
  const event = changetype<Withdraw>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("contractVersion", ethereum.Value.fromFixedBytes(CONTRACT_VERSION)));
  event.parameters.push(new ethereum.EventParam("tokenAddress", ethereum.Value.fromAddress(tokenAddress)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("withdrawalAddress", ethereum.Value.fromAddress(Address.zero())));
  event.parameters.push(new ethereum.EventParam("newNote", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("newNoteIndex", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("relayerAddress", ethereum.Value.fromAddress(Address.zero())));
  event.parameters.push(new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("macSalt", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("macCommitment", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("pocketMoney", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("protocolFee", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));
  event.parameters.push(new ethereum.EventParam("memo", ethereum.Value.fromBytes(MEMO)));

  return event;
}
