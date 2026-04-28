import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { InstanceStateUpdated } from "../../generated/InstanceRegistry/InstanceRegistry";

export function createInstanceStateUpdatedEvent(instance: Address, state: BigInt): InstanceStateUpdated {
  const event = changetype<InstanceStateUpdated>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("instance", ethereum.Value.fromAddress(instance)));
  event.parameters.push(new ethereum.EventParam("state", ethereum.Value.fromUnsignedBigInt(state)));

  return event;
}
