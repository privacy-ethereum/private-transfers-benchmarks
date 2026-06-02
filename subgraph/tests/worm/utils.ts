import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Withdrawal } from "../../generated/WETH/WETH";

export function createWithdrawEvent(hash: Bytes, to: Address, wad: BigInt): Withdrawal {
  const event = changetype<Withdrawal>(newMockEvent());
  event.transaction.hash = hash;

  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("src", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("wad", ethereum.Value.fromUnsignedBigInt(wad)));

  return event;
}
