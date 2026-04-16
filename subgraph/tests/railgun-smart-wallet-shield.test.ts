import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleShield } from "../src/railgun-smart-wallet";

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

  test("Commitment created", () => {
    assert.entityCount("RailgunCommitment", 1);
    assert.fieldEquals("RailgunCommitment", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1-c-0", "value", "100");
  });

  test("Ciphertext created", () => {
    assert.entityCount("RailgunShieldCiphertext", 1);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("RailgunProtocolStats", "railgun-protocol-stats", "totalTxCount", "1");
  });

  test("Shield token stats updated", () => {
    const tokenAddress = "0x0000000000000000000000000000000000000001";

    assert.entityCount("RailgunShieldTokenStats", 1);
    assert.fieldEquals("RailgunShieldTokenStats", tokenAddress, "totalValue", "100");
    assert.fieldEquals("RailgunShieldTokenStats", tokenAddress, "totalCount", "1");
    assert.fieldEquals("RailgunShieldTokenStats", tokenAddress, "totalGasUsed", "1");
  });

  test("Operation stats updated (shield)", () => {
    assert.fieldEquals("RailgunOperationStats", "railgun-protocol-stats-shield", "totalCount", "1");
  });
});
