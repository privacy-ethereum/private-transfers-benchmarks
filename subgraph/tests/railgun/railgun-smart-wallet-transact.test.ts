import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleTransact } from "../../src/railgun/railgun-smart-wallet";

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

  test("Protocol stats updated", () => {
    assert.fieldEquals("RailgunProtocolStats", "railgun-protocol-stats", "totalTxCount", "1");
  });

  test("Operation stats updated (transact)", () => {
    assert.fieldEquals("RailgunOperationStats", "railgun-protocol-stats-transact", "totalCount", "1");
  });
});
