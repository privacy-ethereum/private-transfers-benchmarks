import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleNullified } from "../../src/hinkal/hinkal-pool";

import { createNullifiedEvent, createTransferLog } from "./hinkal-utils";

describe("Unshield ERC20 tests", () => {
  beforeAll(() => {
    const TOKEN = Address.fromString("0x0000000000000000000000000000000000000001");

    const feeLog = createTransferLog(
      TOKEN,
      Address.fromString("0x00000000000000000000000000000000000000aa"),
      Address.fromString("0x00000000000000000000000000000000000000ff"),
      BigInt.fromI32(1),
    );

    const transferLog = createTransferLog(
      TOKEN,
      Address.fromString("0x00000000000000000000000000000000000000aa"),
      Address.fromString("0x00000000000000000000000000000000000000bb"),
      BigInt.fromI32(100),
    );

    const event = createNullifiedEvent([feeLog, transferLog]);

    handleNullified(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("HinkalUnshieldERC20 created", () => {
    assert.entityCount("HinkalUnshieldERC20", 1);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("HinkalProtocolStats", "hinkal-protocol-stats", "totalTxCount", "1");
  });

  test("Unshield token stats updated", () => {
    const id = "hinkal-unshield-0x0000000000000000000000000000000000000001";

    assert.entityCount("HinkalUnshieldERC20TokenStats", 1);

    assert.fieldEquals("HinkalUnshieldERC20TokenStats", id, "totalValue", "100");

    assert.fieldEquals("HinkalUnshieldERC20TokenStats", id, "totalCount", "1");

    assert.fieldEquals("HinkalUnshieldERC20TokenStats", id, "totalGasUsed", "1");
  });

  test("Operation stats updated (unshield ERC20)", () => {
    assert.fieldEquals("HinkalOperationStats", "hinkal-protocol-stats-unshield-erc20", "totalCount", "1");
  });
});
