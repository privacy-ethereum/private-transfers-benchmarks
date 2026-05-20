import { BigInt } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleWrapped } from "../../src/zerc20/liquidity-manager";

import { createWrappedEvent, PROTOCOL_ID, PROTOCOL_STATS_ID } from "./utils";

const OPERATION_ID = "wrap-native-eth";

const VALUE = BigInt.fromI32(100);

describe("LiquidityManager wrap event tests", () => {
  beforeAll(() => {
    const event = createWrappedEvent(VALUE);

    handleWrapped(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("ZERC20Wrap created", () => {
    assert.entityCount("ZERC20Wrap", 1);
  });

  test("ZERC20Wrap values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("ZERC20Wrap", id, "value", VALUE.toString());
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("ZERC20ProtocolStats", PROTOCOL_STATS_ID, "totalTxCount", "1");
    assert.fieldEquals("ZERC20ProtocolStats", PROTOCOL_STATS_ID, "totalGasUsed", "1");
  });

  test("Operation stats updated (wrap)", () => {
    assert.fieldEquals("ZERC20OperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalCount", "1");
    assert.fieldEquals("ZERC20OperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
    assert.fieldEquals("ZERC20OperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalValue", VALUE.toString());
  });

  test("Wrap stats updated", () => {
    assert.fieldEquals("ZERC20WrappedStats", `${PROTOCOL_ID}-${OPERATION_ID}`, "totalCount", "1");
    assert.fieldEquals("ZERC20WrappedStats", `${PROTOCOL_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
    assert.fieldEquals("ZERC20WrappedStats", `${PROTOCOL_ID}-${OPERATION_ID}`, "totalValue", VALUE.toString());
  });
});
