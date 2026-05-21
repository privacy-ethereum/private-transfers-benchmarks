import { BigInt } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleUnwrapped } from "../../src/zerc20/liquidity-manager";

import { createUnwrappedEvent, PROTOCOL_ID, PROTOCOL_STATS_ID } from "./utils";

const OPERATION_ID = "unwrap-native-eth";

const VALUE = BigInt.fromI32(100);

describe("LiquidityManager unwrap event tests", () => {
  beforeAll(() => {
    const event = createUnwrappedEvent(VALUE);

    handleUnwrapped(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("ZERC20Unwrap created", () => {
    assert.entityCount("ZERC20Unwrap", 1);
  });

  test("ZERC20Unwrap values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("ZERC20Unwrap", id, "value", VALUE.toString());
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("ZERC20ProtocolStats", PROTOCOL_STATS_ID, "totalTxCount", "1");
    assert.fieldEquals("ZERC20ProtocolStats", PROTOCOL_STATS_ID, "totalGasUsed", "1");
  });

  test("Operation stats updated (unwrap)", () => {
    assert.fieldEquals("ZERC20OperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalCount", "1");
    assert.fieldEquals("ZERC20OperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
    assert.fieldEquals("ZERC20OperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalValue", VALUE.toString());
  });

  test("Unwrap stats updated", () => {
    assert.fieldEquals("ZERC20UnwrappedStats", `${PROTOCOL_ID}-${OPERATION_ID}`, "totalCount", "1");
    assert.fieldEquals("ZERC20UnwrappedStats", `${PROTOCOL_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
    assert.fieldEquals("ZERC20UnwrappedStats", `${PROTOCOL_ID}-${OPERATION_ID}`, "totalValue", VALUE.toString());
  });
});
