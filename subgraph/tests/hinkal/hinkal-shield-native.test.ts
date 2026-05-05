import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleNewCommitment } from "../../src/hinkal/hinkal-pool";

import { createShieldNativeEvent } from "./hinkal-utils";

describe("Shield native tests", () => {
  beforeAll(() => {
    const event = createShieldNativeEvent();

    handleNewCommitment(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("HinkalShieldNative created", () => {
    assert.entityCount("HinkalShieldNative", 1);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("HinkalProtocolStats", "hinkal-protocol-stats", "totalTxCount", "1");
  });

  test("Shield native stats updated", () => {
    const id = "hinkal-protocol-stats-shield-native-stats";

    assert.entityCount("HinkalShieldNativeTokenStats", 1);

    assert.fieldEquals("HinkalShieldNativeTokenStats", id, "totalCount", "1");

    assert.fieldEquals("HinkalShieldNativeTokenStats", id, "totalGasUsed", "1");
  });

  test("Operation stats updated (shield native)", () => {
    assert.fieldEquals("HinkalOperationStats", "hinkal-protocol-stats-shield-native", "totalCount", "1");
  });
});
