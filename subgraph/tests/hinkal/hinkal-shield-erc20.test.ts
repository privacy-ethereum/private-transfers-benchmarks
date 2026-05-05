import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleNewCommitment } from "../../src/hinkal/hinkal-pool";

import { createNewCommitmentEvent, createTransferLog } from "./hinkal-utils";

describe("Shield ERC20 tests", () => {
  beforeAll(() => {
    const TOKEN = Address.fromString("0x0000000000000000000000000000000000000001");

    const transferLog = createTransferLog(
      TOKEN,
      Address.fromString("0x00000000000000000000000000000000000000aa"),
      Address.fromString("0x00000000000000000000000000000000000000bb"),
      BigInt.fromI32(100),
    );

    const newCommitmentEvent = createNewCommitmentEvent(transferLog);

    handleNewCommitment(newCommitmentEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("HinkalShieldERC20 created", () => {
    assert.entityCount("HinkalShieldERC20", 1);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("HinkalProtocolStats", "hinkal-protocol-stats", "totalTxCount", "1");
  });

  test("Shield token stats updated", () => {
    const id = "hinkal-shield-0x0000000000000000000000000000000000000001";

    assert.entityCount("HinkalShieldERC20TokenStats", 1);

    assert.fieldEquals("HinkalShieldERC20TokenStats", id, "totalValue", "100");

    assert.fieldEquals("HinkalShieldERC20TokenStats", id, "totalCount", "1");

    assert.fieldEquals("HinkalShieldERC20TokenStats", id, "totalGasUsed", "1");
  });

  test("Operation stats updated (shield ERC20)", () => {
    assert.fieldEquals("HinkalOperationStats", "hinkal-protocol-stats-shield-erc20", "totalCount", "1");
  });
});
