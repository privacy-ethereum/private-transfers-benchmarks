import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleTransact } from "../src/railgun-smart-wallet";

import { createTransactEvent, createTransactCiphertextTuple } from "./railgun-smart-wallet-utils";

describe("Transact event tests", () => {
  beforeAll(() => {
    const ciphertextTuple = createTransactCiphertextTuple(
      [
        Bytes.fromHexString("0x01"),
        Bytes.fromHexString("0x02"),
        Bytes.fromHexString("0x03"),
        Bytes.fromHexString("0x04"),
      ],
      Bytes.fromHexString("0x10"),
      Bytes.fromHexString("0x20"),
      Bytes.fromHexString("0xaa"),
      Bytes.fromHexString("0xbb"),
    );

    const event = createTransactEvent(
      BigInt.fromI32(1),
      BigInt.fromI32(0),
      [Bytes.fromHexString("0x1234")],
      [ciphertextTuple],
    );

    handleTransact(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("RailgunTransact created", () => {
    assert.entityCount("RailgunTransact", 1);
  });

  test("Ciphertext entity created", () => {
    assert.entityCount("RailgunTransactCiphertext", 1);
  });

  test("Ciphertext fields stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1-ct-0";

    assert.fieldEquals("RailgunTransactCiphertext", id, "ciphertext0", "0x01");
    assert.fieldEquals("RailgunTransactCiphertext", id, "ciphertext1", "0x02");
    assert.fieldEquals("RailgunTransactCiphertext", id, "ciphertext2", "0x03");
    assert.fieldEquals("RailgunTransactCiphertext", id, "ciphertext3", "0x04");

    assert.fieldEquals("RailgunTransactCiphertext", id, "blindedSenderViewingKey", "0x10");

    assert.fieldEquals("RailgunTransactCiphertext", id, "blindedReceiverViewingKey", "0x20");
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("RailgunProtocolStats", "railgun-protocol-stats", "totalTxCount", "1");
  });

  test("Operation stats updated (transact)", () => {
    assert.fieldEquals("RailgunOperationStats", "railgun-protocol-stats-transact", "totalCount", "1");
  });
});
