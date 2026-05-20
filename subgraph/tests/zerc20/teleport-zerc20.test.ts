import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleTeleport } from "../../src/zerc20/zerc20";

import { createTeleportNativeEvent, PROTOCOL_ID, PROTOCOL_STATS_ID } from "./utils";

const OPERATION_ID = "teleport-native-eth";

const FROM = Address.fromString("0x0000000000000000000000000000000000000001");
const TO = Address.fromString("0x0000000000000000000000000000000000000002");
const VALUE = BigInt.fromI32(100);

describe("ZERC20 teleport event tests", () => {
  beforeAll(() => {
    const event = createTeleportNativeEvent(FROM, TO, VALUE);

    handleTeleport(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("ZERC20Teleport created", () => {
    assert.entityCount("ZERC20Teleport", 1);
  });

  test("ZERC20Teleport values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("ZERC20Teleport", id, "from", FROM.toHexString());
    assert.fieldEquals("ZERC20Teleport", id, "to", TO.toHexString());
    assert.fieldEquals("ZERC20Teleport", id, "value", VALUE.toString());
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("ZERC20ProtocolStats", PROTOCOL_STATS_ID, "totalTxCount", "1");
    assert.fieldEquals("ZERC20ProtocolStats", PROTOCOL_STATS_ID, "totalGasUsed", "1");
  });

  test("Operation stats updated (teleport)", () => {
    assert.fieldEquals("ZERC20OperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalCount", "1");
    assert.fieldEquals("ZERC20OperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
    assert.fieldEquals("ZERC20OperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalValue", VALUE.toString());
  });

  test("Teleport stats updated", () => {
    assert.fieldEquals("ZERC20TeleportStats", `${PROTOCOL_ID}-${OPERATION_ID}`, "totalCount", "1");
    assert.fieldEquals("ZERC20TeleportStats", `${PROTOCOL_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
    assert.fieldEquals("ZERC20TeleportStats", `${PROTOCOL_ID}-${OPERATION_ID}`, "totalValue", VALUE.toString());
  });
});
