import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleUnshield } from "../src/railgun-smart-wallet";

import { createUnshieldEvent } from "./railgun-smart-wallet-utils";

describe("Unshield event tests", () => {
  beforeAll(() => {
    const event = createUnshieldEvent(
      Address.fromString("0x0000000000000000000000000000000000000002"),
      0,
      Address.fromString("0x0000000000000000000000000000000000000001"),
      BigInt.fromI32(0),
      BigInt.fromI32(500),
      BigInt.fromI32(10),
    );

    handleUnshield(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("RailgunUnshield created", () => {
    assert.entityCount("RailgunUnshield", 1);
  });

  test("Unshield token stats updated", () => {
    const expectedId = "0x0000000000000000000000000000000000000001";

    assert.entityCount("RailgunUnshieldTokenStats", 1);
    assert.fieldEquals("RailgunUnshieldTokenStats", expectedId, "totalValue", "500");
    assert.fieldEquals("RailgunUnshieldTokenStats", expectedId, "totalCount", "1");
    assert.fieldEquals("RailgunUnshieldTokenStats", expectedId, "totalGasUsed", "1");
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("RailgunProtocolStats", "railgun-protocol-stats", "totalTxCount", "1");
  });

  test("Operation stats updated (unshield)", () => {
    assert.fieldEquals("RailgunOperationStats", "railgun-protocol-stats-unshield", "totalCount", "1");
  });

  test("RailgunUnshield values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("RailgunUnshield", id, "amount", "500");
    assert.fieldEquals("RailgunUnshield", id, "fee", "10");
    assert.fieldEquals("RailgunUnshield", id, "tokenAddress", "0x0000000000000000000000000000000000000001");
    assert.fieldEquals("RailgunUnshield", id, "to", "0x0000000000000000000000000000000000000002");
  });

  test("Unshield entity has correct ID format", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("RailgunUnshield", id, "id", id);
  });

  test("Unshield token stats updated", () => {
    const tokenAddress = "0x0000000000000000000000000000000000000001";

    assert.entityCount("RailgunUnshieldTokenStats", 1);
    assert.fieldEquals("RailgunUnshieldTokenStats", tokenAddress, "totalValue", "500");
    assert.fieldEquals("RailgunUnshieldTokenStats", tokenAddress, "totalCount", "1");
    assert.fieldEquals("RailgunUnshieldTokenStats", tokenAddress, "totalGasUsed", "1");
  });
});
