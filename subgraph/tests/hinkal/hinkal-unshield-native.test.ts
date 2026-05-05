import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleNullified } from "../../src/hinkal/hinkal-pool";

import { createUnshieldNativeEvent } from "./hinkal-utils";

describe("Unshield native tests", () => {
  beforeAll(() => {
    const event = createUnshieldNativeEvent();

    handleNullified(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("HinkalUnshieldNative created", () => {
    assert.entityCount("HinkalUnshieldNative", 1);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("HinkalProtocolStats", "hinkal-protocol-stats", "totalTxCount", "1");
  });

  test("Unshield native stats updated", () => {
    const id = "hinkal-protocol-stats-unshield-native-stats";

    assert.entityCount("HinkalUnshieldNativeTokenStats", 1);

    assert.fieldEquals("HinkalUnshieldNativeTokenStats", id, "totalCount", "1");

    assert.fieldEquals("HinkalUnshieldNativeTokenStats", id, "totalGasUsed", "1");
  });

  test("Operation stats updated (unshield native)", () => {
    assert.fieldEquals("HinkalOperationStats", "hinkal-protocol-stats-unshield-native", "totalCount", "1");
  });
});
