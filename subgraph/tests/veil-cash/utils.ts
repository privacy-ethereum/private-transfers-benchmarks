import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { NewNullifier } from "../../generated/VeilETHPool/VeilETHPool";
import { DepositAccepted, DepositQueued } from "../../generated/VeilETHQueueV3/VeilETHQueueV3";

export const PROTOCOL_STATS_ID = "veil-cash-protocol-stats";
export const VEIL_ETH_POOL_ADDRESS = Address.fromString("0x293dcda114533ff8f477271c5ca517209ffdeee7");

export function createDepositQueuedEvent(
  nonce: BigInt,
  sender: Address,
  amount: BigInt,
  depositKey: Bytes,
): DepositQueued {
  const event = changetype<DepositQueued>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("nonce", ethereum.Value.fromUnsignedBigInt(nonce)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("depositKey", ethereum.Value.fromBytes(depositKey)));

  return event;
}

export function createDepositAcceptedEvent(
  nonce: BigInt,
  operator: Address,
  veilEntry: Address,
  amount: BigInt,
): DepositAccepted {
  const event = changetype<DepositAccepted>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("nonce", ethereum.Value.fromUnsignedBigInt(nonce)));
  event.parameters.push(new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator)));
  event.parameters.push(new ethereum.EventParam("veilEntry", ethereum.Value.fromAddress(veilEntry)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  return event;
}

export function createNewNullifierEvent(hash: Bytes): NewNullifier {
  const event = changetype<NewNullifier>(newMockEvent());
  event.transaction.hash = hash;
  event.parameters = [];

  event.parameters.push(
    new ethereum.EventParam(
      "nullifier",
      ethereum.Value.fromFixedBytes(
        Bytes.fromHexString("0x05d20f560baa10dd0524a21cde8dd1e75fb35a4839c6c3b6e57239457844f914"),
      ),
    ),
  );

  return event;
}
