import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Shield, Transact, Unshield } from "../generated/RailgunSmartWallet/RailgunSmartWallet";

export function createShieldEvent(
  treeNumber: BigInt,
  startPosition: BigInt,
  fees: BigInt[],
  commitments: ethereum.Tuple[],
  ciphertexts: ethereum.Tuple[],
): Shield {
  const event = changetype<Shield>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("treeNumber", ethereum.Value.fromUnsignedBigInt(treeNumber)));
  event.parameters.push(new ethereum.EventParam("startPosition", ethereum.Value.fromUnsignedBigInt(startPosition)));
  event.parameters.push(new ethereum.EventParam("commitments", ethereum.Value.fromTupleArray(commitments)));
  event.parameters.push(new ethereum.EventParam("shieldCiphertext", ethereum.Value.fromTupleArray(ciphertexts)));

  const feesArray = new Array<ethereum.Value>();

  for (let index = 0; index < fees.length; index += 1) {
    feesArray.push(ethereum.Value.fromUnsignedBigInt(fees[index]));
  }

  event.parameters.push(new ethereum.EventParam("fees", ethereum.Value.fromArray(feesArray)));

  return event;
}

export function createCommitmentTuple(
  npk: Bytes,
  tokenType: i32,
  tokenAddress: Address,
  tokenSubID: BigInt,
  value: BigInt,
): ethereum.Tuple {
  const tokenTuple = new ethereum.Tuple();
  tokenTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenType)));
  tokenTuple.push(ethereum.Value.fromAddress(tokenAddress));
  tokenTuple.push(ethereum.Value.fromUnsignedBigInt(tokenSubID));

  const commitment = new ethereum.Tuple();
  commitment.push(ethereum.Value.fromBytes(npk));
  commitment.push(ethereum.Value.fromTuple(tokenTuple));
  commitment.push(ethereum.Value.fromUnsignedBigInt(value));

  return commitment;
}

export function createShieldCiphertextTuple(
  bundle0: Bytes,
  bundle1: Bytes,
  bundle2: Bytes,
  shieldKey: Bytes,
): ethereum.Tuple {
  const ciphertext = new ethereum.Tuple();

  const bundle: Bytes[] = [bundle0, bundle1, bundle2];

  ciphertext.push(ethereum.Value.fromBytesArray(bundle));
  ciphertext.push(ethereum.Value.fromBytes(shieldKey));

  return ciphertext;
}

export function createUnshieldEvent(
  to: Address,
  tokenType: i32,
  tokenAddress: Address,
  tokenSubID: BigInt,
  amount: BigInt,
  fee: BigInt,
): Unshield {
  const event = changetype<Unshield>(newMockEvent());
  event.parameters = [];

  const tokenTuple = new ethereum.Tuple();
  tokenTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenType)));
  tokenTuple.push(ethereum.Value.fromAddress(tokenAddress));
  tokenTuple.push(ethereum.Value.fromUnsignedBigInt(tokenSubID));

  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromTuple(tokenTuple)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee)));

  return event;
}

export function createTransactCiphertextTuple(
  ciphertext: Bytes[],
  blindedSenderViewingKey: Bytes,
  blindedReceiverViewingKey: Bytes,
  annotationData: Bytes,
  memo: Bytes,
): ethereum.Tuple {
  const tuple = new ethereum.Tuple();

  tuple.push(ethereum.Value.fromFixedBytesArray(ciphertext));
  tuple.push(ethereum.Value.fromFixedBytes(blindedSenderViewingKey));
  tuple.push(ethereum.Value.fromFixedBytes(blindedReceiverViewingKey));
  tuple.push(ethereum.Value.fromBytes(annotationData));
  tuple.push(ethereum.Value.fromBytes(memo));

  return tuple;
}

export function createTransactEvent(
  treeNumber: BigInt,
  startPosition: BigInt,
  hashes: Bytes[],
  ciphertexts: ethereum.Tuple[],
): Transact {
  const event = changetype<Transact>(newMockEvent());
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("treeNumber", ethereum.Value.fromUnsignedBigInt(treeNumber)));
  event.parameters.push(new ethereum.EventParam("startPosition", ethereum.Value.fromUnsignedBigInt(startPosition)));
  event.parameters.push(new ethereum.EventParam("hash", ethereum.Value.fromFixedBytesArray(hashes)));
  event.parameters.push(new ethereum.EventParam("ciphertext", ethereum.Value.fromTupleArray(ciphertexts)));

  return event;
}
