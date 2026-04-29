import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Deposit, Withdrawal } from "../../generated/templates/TornadoInstance/TornadoInstance";

export function createDepositEvent(
  instanceAddress: Address,
  commitment: Bytes,
  leafIndex: i32,
  depositTimestamp: BigInt,
  amount: BigInt,
): Deposit {
  const event = changetype<Deposit>(newMockEvent());
  event.parameters = [];

  event.address = instanceAddress;
  event.parameters.push(new ethereum.EventParam("commitment", ethereum.Value.fromFixedBytes(commitment)));
  event.parameters.push(
    new ethereum.EventParam("leafIndex", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(leafIndex))),
  );
  event.parameters.push(new ethereum.EventParam("timestamp", ethereum.Value.fromUnsignedBigInt(depositTimestamp)));
  event.transaction.value = amount;

  return event;
}

export function createWithdrawalEvent(
  instanceAddress: Address,
  to: Address,
  nullifierHash: Bytes,
  relayer: Address,
  fee: BigInt,
): Withdrawal {
  const event = changetype<Withdrawal>(newMockEvent());
  event.parameters = [];

  event.address = instanceAddress;
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("nullifierHash", ethereum.Value.fromFixedBytes(nullifierHash)));
  event.parameters.push(new ethereum.EventParam("relayer", ethereum.Value.fromAddress(relayer)));
  event.parameters.push(new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee)));

  return event;
}
