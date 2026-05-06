import { Address, Bytes } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleUnshielded } from "../../src/redact/confidential-eth";

import { createUnshieldedEvent } from "./utils";

describe("Unshielded event tests", () => {
  beforeAll(() => {
    const event = createUnshieldedEvent(
      Address.fromString("0x0000000000000000000000000000000000000002"),
      Bytes.fromHexString("0x313030"),
    );

    handleUnshielded(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("RedactUnshielded created", () => {
    assert.entityCount("RedactUnshielded", 1);
  });

  test("RedactUnshielded values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("RedactUnshielded", id, "to", "0x0000000000000000000000000000000000000002");
    assert.fieldEquals("RedactUnshielded", id, "amount", "0x313030");
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("RedactProtocolStats", "redact-protocol-stats", "totalTxCount", "1");
    assert.fieldEquals("RedactProtocolStats", "redact-protocol-stats", "totalGasUsed", "1");
  });

  test("Operation stats updated (unshielded)", () => {
    assert.fieldEquals("RedactOperationStats", "redact-protocol-stats-unshielded", "totalCount", "1");
    assert.fieldEquals("RedactOperationStats", "redact-protocol-stats-unshielded", "totalGasUsed", "1");
  });

  test("Unshielded token stats updated", () => {
    const id = "redact-unshield-native-eth";

    assert.entityCount("RedactUnshieldedStats", 1);
    assert.fieldEquals("RedactUnshieldedStats", id, "totalCount", "1");
    assert.fieldEquals("RedactUnshieldedStats", id, "totalGasUsed", "1");
  });
});
