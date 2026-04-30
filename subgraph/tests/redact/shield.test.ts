import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleShieldedNative } from "../../src/redact/confidential-eth";

import { createShieldedNativeEvent } from "./utils";

describe("ShieldedNative event tests", () => {
  beforeAll(() => {
    const event = createShieldedNativeEvent(
      Address.fromString("0x0000000000000000000000000000000000000001"),
      Address.fromString("0x0000000000000000000000000000000000000002"),
      BigInt.fromI32(100),
    );

    handleShieldedNative(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("RedactShieldedNative created", () => {
    assert.entityCount("RedactShieldedNative", 1);
  });

  test("RedactShieldedNative values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("RedactShieldedNative", id, "from", "0x0000000000000000000000000000000000000001");
    assert.fieldEquals("RedactShieldedNative", id, "to", "0x0000000000000000000000000000000000000002");
    assert.fieldEquals("RedactShieldedNative", id, "value", "100");
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("RedactProtocolStats", "redact-protocol-stats", "totalTxCount", "1");
    assert.fieldEquals("RedactProtocolStats", "redact-protocol-stats", "totalGasUsed", "1");
  });

  test("Operation stats updated (shield-native)", () => {
    assert.fieldEquals("RedactOperationStats", "redact-protocol-stats-shield-native", "totalCount", "1");
    assert.fieldEquals("RedactOperationStats", "redact-protocol-stats-shield-native", "totalGasUsed", "1");
  });

  test("Shielded token stats updated", () => {
    const id = "native-eth";

    assert.entityCount("RedactShieldedStats", 1);
    assert.fieldEquals("RedactShieldedStats", id, "totalValue", "100");
    assert.fieldEquals("RedactShieldedStats", id, "totalCount", "1");
    assert.fieldEquals("RedactShieldedStats", id, "totalGasUsed", "1");
  });
});
