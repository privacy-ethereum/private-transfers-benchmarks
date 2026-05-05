import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { ShieldedNative, Unshielded } from "../../generated/ConfidentialETH/ConfidentialETH";

export function createShieldedNativeEvent(from: Address, to: Address, value: BigInt): ShieldedNative {
  const event = changetype<ShieldedNative>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value)));

  return event;
}

export function createUnshieldedEvent(to: Address, amount: Bytes): Unshielded {
  const event = changetype<Unshielded>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromFixedBytes(amount)));

  return event;
}
