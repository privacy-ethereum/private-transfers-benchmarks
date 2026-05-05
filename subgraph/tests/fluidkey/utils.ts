import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { OperationRelayed } from "../../generated/SmartAccountRelayer/SmartAccountRelayer";

export function createOperationRelayedEvent(from: Address, operationId: BigInt, success: boolean): OperationRelayed {
  const event = changetype<OperationRelayed>(newMockEvent());
  event.transaction.from = from;
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("operationId", ethereum.Value.fromUnsignedBigInt(operationId)));
  event.parameters.push(new ethereum.EventParam("success", ethereum.Value.fromBoolean(success)));

  return event;
}
