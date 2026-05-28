import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { afterAll, assert, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleWithdrawal } from "../../src/intmax/withdrawal";

import { createWithdrawalEvent } from "./utils";

describe("Intmax Scroll withdrawal tests", () => {
  beforeAll(() => {
    const event = createWithdrawalEvent(
      Bytes.fromHexString("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
      Address.fromString("0x0000000000000000000000000000000000000002"),
      1,
      BigInt.fromI32(100),
    );

    handleWithdrawal(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("Withdrawal entity created", () => {
    assert.entityCount("IntmaxScrollWithdrawal", 1);
  });

  test("Withdrawal values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("IntmaxScrollWithdrawal", id, "amount", "100");
    assert.fieldEquals("IntmaxScrollWithdrawal", id, "tokenIndex", "1");
    assert.fieldEquals("IntmaxScrollWithdrawal", id, "txHash", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a");
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("IntmaxScrollProtocolStats", "intmax-scroll-protocol-stats", "totalTxCount", "1");
  });

  test("Operation stats updated (withdrawal)", () => {
    assert.fieldEquals("IntmaxScrollOperationStats", "intmax-scroll-protocol-stats-withdrawal", "totalCount", "1");
  });

  test("Withdrawal stats updated", () => {
    const id = `intmax-scroll-withdrawal-1`;

    assert.fieldEquals("IntmaxScrollWithdrawalStats", id, "tokenIndex", "1");
    assert.fieldEquals("IntmaxScrollWithdrawalStats", id, "totalCount", "1");
    assert.fieldEquals("IntmaxScrollWithdrawalStats", id, "totalValue", "100");
  });
});
