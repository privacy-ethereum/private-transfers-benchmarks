import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Unwrapped, Wrapped } from "../../generated/LiquidityManager/LiquidityManager";
import { Teleport } from "../../generated/zERC20/zERC20";

export const PROTOCOL_ID = "zerc20";
export const PROTOCOL_STATS_ID = `${PROTOCOL_ID}-protocol-stats`;

export function createWrappedEvent(value: BigInt): Wrapped {
  const event = changetype<Wrapped>(newMockEvent());
  event.transaction.value = value;

  return event;
}

export function createUnwrappedEvent(value: BigInt): Unwrapped {
  const event = changetype<Unwrapped>(newMockEvent());
  event.parameters = [];

  const zeroAddress = Address.zero();

  event.parameters.push(new ethereum.EventParam("caller", ethereum.Value.fromAddress(zeroAddress)));
  event.parameters.push(new ethereum.EventParam("receiver", ethereum.Value.fromAddress(zeroAddress)));
  event.parameters.push(new ethereum.EventParam("amountOut", ethereum.Value.fromUnsignedBigInt(value)));
  event.parameters.push(new ethereum.EventParam("feeAmount", ethereum.Value.fromUnsignedBigInt(BigInt.zero())));

  return event;
}

export function createTeleportNativeEvent(from: Address, to: Address, value: BigInt): Teleport {
  const event = changetype<Teleport>(newMockEvent());
  event.transaction.from = from;
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value)));

  return event;
}
