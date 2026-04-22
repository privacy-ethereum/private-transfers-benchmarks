import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { ShieldedNative } from "../../generated/ConfidentialETH/ConfidentialETH";

export function createShieldedNativeEvent(from: Address, to: Address, value: BigInt): ShieldedNative {
  const event = changetype<ShieldedNative>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value)));

  return event;
}
