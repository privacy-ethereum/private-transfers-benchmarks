import { Address } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleNewCommitment } from "../../src/hinkal/hinkal-pool";

import { createNewCommitmentEvent, createNullifiedLog } from "./hinkal-utils";

describe("Internal Transfer tests", () => {
  beforeAll(() => {
    const nullifiedLog = createNullifiedLog(Address.fromString("0x00000000000000000000000000000000000000ff"));
    const newCommitmentEvent = createNewCommitmentEvent(nullifiedLog);

    handleNewCommitment(newCommitmentEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("HinkalTransact created", () => {
    assert.entityCount("HinkalTransact", 1);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("HinkalProtocolStats", "hinkal-protocol-stats", "totalTxCount", "1");
  });

  test("Transact token stats updated", () => {
    const id = "hinkal-protocol-stats-transact-stats";

    assert.entityCount("HinkalTransactTokenStats", 1);

    assert.fieldEquals("HinkalTransactTokenStats", id, "totalCount", "1");

    assert.fieldEquals("HinkalTransactTokenStats", id, "totalGasUsed", "1");
  });

  test("Operation stats updated (transact)", () => {
    assert.fieldEquals("HinkalOperationStats", "hinkal-protocol-stats-transact", "totalCount", "1");
  });
});
