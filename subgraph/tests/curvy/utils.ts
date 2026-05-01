import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Withdraw } from "../../generated/CurvyVaultV6/CurvyVaultV6";

export function createWithdrawEvent(from: Address, tokenAddress: Address, to: Address, amount: BigInt): Withdraw {
  const event = changetype<Withdraw>(newMockEvent());
  event.transaction.from = from;
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("tokenAddress", ethereum.Value.fromAddress(tokenAddress)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  return event;
}
