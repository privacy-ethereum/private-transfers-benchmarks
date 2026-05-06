import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleShield } from "../../src/railgun/railgun-smart-wallet";

import { createShieldEvent, createCommitmentTuple, createShieldCiphertextTuple } from "./railgun-smart-wallet-utils";

describe("Shield event tests", () => {
  beforeAll(() => {
    const tokenAddress = Address.fromString("0x0000000000000000000000000000000000000001");

    const commitment = createCommitmentTuple(
      Bytes.fromHexString("0x01"),
      0,
      tokenAddress,
      BigInt.fromI32(0),
      BigInt.fromI32(100),
    );

    const ciphertext = createShieldCiphertextTuple(
      Bytes.fromHexString("0x01"),
      Bytes.fromHexString("0x02"),
      Bytes.fromHexString("0x03"),
      Bytes.fromHexString("0x04"),
    );

    const event = createShieldEvent(
      BigInt.fromI32(1),
      BigInt.fromI32(0),
      [BigInt.fromI32(1)],
      [commitment],
      [ciphertext],
    );

    handleShield(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("RailgunShield created", () => {
    assert.entityCount("RailgunShield", 1);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("RailgunProtocolStats", "railgun-protocol-stats", "totalTxCount", "1");
  });

  test("Shield token stats updated", () => {
    const id = "railgun-shield-0x0000000000000000000000000000000000000001";

    assert.entityCount("RailgunShieldTokenStats", 1);
    assert.fieldEquals("RailgunShieldTokenStats", id, "totalValue", "100");
    assert.fieldEquals("RailgunShieldTokenStats", id, "totalCount", "1");
    assert.fieldEquals("RailgunShieldTokenStats", id, "totalGasUsed", "1");
  });

  test("Operation stats updated (shield)", () => {
    assert.fieldEquals("RailgunOperationStats", "railgun-protocol-stats-shield", "totalCount", "1");
  });
});
