import { Address, BigInt, Bytes, crypto as graphCrypto, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Transfer } from "../../generated/BETH/BETH";
import {
  INDEX_FOR_TRANSFER_TO_FINAL_RECIPIENT_EVENT,
  INDEX_FOR_WETH_WITHDRAW_EVENT,
  WITHDRAW_EVENTS,
} from "../../src/worm/beth";

const BETH_CONTRACT = ethereum.Value.fromAddress(Address.fromString("0x5624344235607940d4d4EE76Bf8817d403EB9Cf8"));

const BETH_TO_ETH_CONTRACT = ethereum.Value.fromAddress(
  Address.fromString("0xbA5A285806c343AaD955a40FE4b6e5e607B752b6"),
);

/**
 * Pad bytes to 32 bytes (left-pad with zeros)
 * @param bytesToPad bytes to pad
 * @returns 32-byte padded value
 */
function padBytes32(bytesToPad: Bytes): Bytes {
  if (bytesToPad.length >= 32) {
    return bytesToPad;
  }

  let result = bytesToPad;
  const padding = 32 - bytesToPad.length;

  for (let i = 0; i < padding; i += 1) {
    result = Bytes.fromHexString("0x00").concat(result);
  }

  return result;
}

/**
 * Convert a BigInt to 32-byte padded representation
 * @param num the number to encode
 * @returns 32-byte encoded value
 */
function bigIntToBytes32(num: BigInt): Bytes {
  const encoded = ethereum.encode(ethereum.Value.fromUnsignedBigInt(num));
  return encoded !== null ? padBytes32(encoded) : Bytes.empty();
}

/**
 * Create a receipt log with custom topics
 * @param txHash hash of the tx
 * @param logIndex log index
 * @param topics log/event elements
 * @returns a formatted Log to be inserted in event.receipt.logs
 */
function createReceiptLog(txHash: Bytes, logIndex: i32, topics: Bytes[]): ethereum.Log {
  return new ethereum.Log(
    Address.zero(),
    topics,
    Bytes.empty(),
    Bytes.empty(),
    Bytes.empty(),
    txHash,
    BigInt.fromI32(0),
    BigInt.fromI32(logIndex),
    BigInt.fromI32(logIndex),
    "",
    null,
  );
}

/**
 * Create the Transfer event emitted by the BETH contract when a withdraw happens
 * @param hash hash of the tx
 * @param to final/end receiver of the withdraw tx
 * @param value amount being withdrawn
 * @returns a ERC20 Transfer event with a receipt containing all logs of a withdraw tx
 */
export function createTransferEvent(hash: Bytes, to: Address, value: BigInt): Transfer {
  const event = changetype<Transfer>(newMockEvent());
  event.transaction.hash = hash;
  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.zero())));
  event.parameters.push(new ethereum.EventParam("to", BETH_CONTRACT));
  event.parameters.push(new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value)));

  const logs: ethereum.Log[] = [];

  for (let i = 0; i < WITHDRAW_EVENTS.length; i += 1) {
    const keccakResult = graphCrypto.keccak256(Bytes.fromUTF8(WITHDRAW_EVENTS[i]));
    const signatureTopic = Bytes.fromByteArray(keccakResult);
    const topics: Bytes[] = [];
    topics.push(signatureTopic);

    // eslint-disable-next-line eqeqeq
    if (i == INDEX_FOR_WETH_WITHDRAW_EVENT) {
      // Swap event: topic[1] = contract, topic[2] = amount
      const contract = BETH_TO_ETH_CONTRACT.toAddress();
      topics.push(padBytes32(contract));
      topics.push(bigIntToBytes32(value));
    }

    // eslint-disable-next-line eqeqeq
    if (i == INDEX_FOR_TRANSFER_TO_FINAL_RECIPIENT_EVENT) {
      // Transfer event: topic[1] = from, topic[2] = to, topic[3] = value
      const contractAddr = BETH_CONTRACT.toAddress();
      const toAddr = to;
      topics.push(padBytes32(contractAddr));
      topics.push(padBytes32(toAddr));
      topics.push(bigIntToBytes32(value));
    }

    const log = createReceiptLog(event.transaction.hash, i, topics);
    logs.push(log);
  }

  event.receipt = new ethereum.TransactionReceipt(
    event.transaction.hash,
    BigInt.fromI32(0),
    Bytes.empty(),
    event.block.number,
    BigInt.fromI32(0),
    BigInt.fromI32(21000),
    Address.zero(),
    logs,
    BigInt.fromI32(1),
    Bytes.empty(),
    Bytes.empty(),
  );

  return event;
}
