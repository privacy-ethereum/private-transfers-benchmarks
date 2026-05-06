import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import {
  Deposited,
  PoolRegistered,
  PoolRemoved,
  WithdrawalRelayed,
} from "../../generated/PrivacyPoolsEntrypointProxy/PrivacyPoolsEntrypointProxy";

export function createDepositEvent(depositor: Address, pool: Address, commitment: BigInt, amount: BigInt): Deposited {
  const event = changetype<Deposited>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("_depositor", ethereum.Value.fromAddress(depositor)));
  event.parameters.push(new ethereum.EventParam("_pool", ethereum.Value.fromAddress(pool)));
  event.parameters.push(new ethereum.EventParam("_commitment", ethereum.Value.fromUnsignedBigInt(commitment)));
  event.parameters.push(new ethereum.EventParam("_amount", ethereum.Value.fromUnsignedBigInt(amount)));

  return event;
}

export function createWithdrawalEvent(
  relayer: Address,
  recipient: Address,
  asset: Address,
  amount: BigInt,
  fee: BigInt,
): WithdrawalRelayed {
  const event = changetype<WithdrawalRelayed>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("_relayer", ethereum.Value.fromAddress(relayer)));
  event.parameters.push(new ethereum.EventParam("_recipient", ethereum.Value.fromAddress(recipient)));
  event.parameters.push(new ethereum.EventParam("_asset", ethereum.Value.fromAddress(asset)));
  event.parameters.push(new ethereum.EventParam("_amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("_feeAmount", ethereum.Value.fromUnsignedBigInt(fee)));

  return event;
}

export function createPoolRegisteredEvent(pool: Address, asset: Address): PoolRegistered {
  const event = changetype<PoolRegistered>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("_pool", ethereum.Value.fromAddress(pool)));
  event.parameters.push(new ethereum.EventParam("_asset", ethereum.Value.fromAddress(asset)));
  event.parameters.push(new ethereum.EventParam("_scope", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))));

  return event;
}

export function createPoolRemovedEvent(pool: Address, asset: Address): PoolRemoved {
  const event = changetype<PoolRemoved>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("_pool", ethereum.Value.fromAddress(pool)));
  event.parameters.push(new ethereum.EventParam("_asset", ethereum.Value.fromAddress(asset)));
  event.parameters.push(new ethereum.EventParam("_scope", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))));

  return event;
}
