import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleDeposit, handlePoolRegistered } from "../../src/privacy-pools/privacy-pools";

import { createDepositEvent, createPoolRegisteredEvent } from "./privacy-pools-utils";

describe("Deposit event tests", () => {
  beforeAll(() => {
    const pool = Address.fromString("0x0000000000000000000000000000000000000001");
    const asset = Address.fromString("0x0000000000000000000000000000000000000002");
    const depositor = Address.fromString("0x0000000000000000000000000000000000000003");

    const registerEvent = createPoolRegisteredEvent(pool, asset);
    handlePoolRegistered(registerEvent);

    const depositEvent = createDepositEvent(depositor, pool, BigInt.fromI32(1), BigInt.fromI32(100));

    handleDeposit(depositEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("PrivacyPoolsDeposit created", () => {
    assert.entityCount("PrivacyPoolsDeposit", 1);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("PrivacyPoolsProtocolStats", "privacy-pools-protocol-stats", "totalTxCount", "1");
  });

  test("Shield stats updated", () => {
    const id = "privacy-pools-shield-0x0000000000000000000000000000000000000001";

    assert.entityCount("PrivacyPoolsShieldStats", 1);
    assert.fieldEquals("PrivacyPoolsShieldStats", id, "totalValue", "100");
    assert.fieldEquals("PrivacyPoolsShieldStats", id, "totalCount", "1");
    assert.fieldEquals("PrivacyPoolsShieldStats", id, "totalGasUsed", "1");
  });

  test("Operation stats updated (shield)", () => {
    assert.fieldEquals("PrivacyPoolsOperationStats", "privacy-pools-protocol-stats-shield", "totalCount", "1");
    assert.fieldEquals("PrivacyPoolsOperationStats", "privacy-pools-protocol-stats-shield", "totalValue", "100");
  });
});
