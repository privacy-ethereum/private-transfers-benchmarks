import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleWithdrawal } from "../../src/privacy-pools/privacy-pools";

import { createWithdrawalEvent } from "./privacy-pools-utils";

describe("Privacy Pools Withdrawal event tests", () => {
  beforeAll(() => {
    const relayer = Address.fromString("0x0000000000000000000000000000000000000001");
    const recipient = Address.fromString("0x0000000000000000000000000000000000000002");
    const asset = Address.fromString("0x0000000000000000000000000000000000000003");

    const event = createWithdrawalEvent(relayer, recipient, asset, BigInt.fromI32(100), BigInt.fromI32(5));

    handleWithdrawal(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("PrivacyPoolsWithdrawal created", () => {
    assert.entityCount("PrivacyPoolsWithdrawal", 1);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("PrivacyPoolsProtocolStats", "privacy-pools-protocol-stats", "totalTxCount", "1");
  });

  test("Unshield stats updated", () => {
    const id = "privacy-pools-unshield-0x0000000000000000000000000000000000000003";

    assert.entityCount("PrivacyPoolsUnshieldStats", 1);
    assert.fieldEquals("PrivacyPoolsUnshieldStats", id, "totalValue", "100");
    assert.fieldEquals("PrivacyPoolsUnshieldStats", id, "totalCount", "1");
    assert.fieldEquals("PrivacyPoolsUnshieldStats", id, "totalGasUsed", "1");
  });

  test("Operation stats updated (unshield)", () => {
    assert.fieldEquals("PrivacyPoolsOperationStats", "privacy-pools-protocol-stats-unshield", "totalCount", "1");
    assert.fieldEquals("PrivacyPoolsOperationStats", "privacy-pools-protocol-stats-unshield", "totalValue", "100");
  });
});
