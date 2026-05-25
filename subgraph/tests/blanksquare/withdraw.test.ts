import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleWithdraw } from "../../src/blanksquare/shielder";

import { createWithdrawEvent } from "./utils";

const PROTOCOL_STATS_ID = "blanksquare-protocol-stats";
const OPERATION_ID = "withdraw";
const WITHDRAW_STATS_ID = "blanksquare-withdraw-native-eth";

const TOKEN_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000");
const VALUE = BigInt.fromI32(100);

describe("Shielder withdraw event tests", () => {
  beforeAll(() => {
    const event = createWithdrawEvent(TOKEN_ADDRESS, VALUE);

    handleWithdraw(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("BlanksquareWithdraw created", () => {
    assert.entityCount("BlanksquareWithdraw", 1);
  });

  test("BlanksquareWithdraw values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("BlanksquareWithdraw", id, "value", VALUE.toString());
    assert.fieldEquals("BlanksquareWithdraw", id, "tokenAddress", TOKEN_ADDRESS.toHexString());
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("BlanksquareProtocolStats", PROTOCOL_STATS_ID, "totalTxCount", "1");
    assert.fieldEquals("BlanksquareProtocolStats", PROTOCOL_STATS_ID, "totalGasUsed", "1");
  });

  test("Operation stats updated (withdraw)", () => {
    assert.fieldEquals("BlanksquareOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalCount", "1");
    assert.fieldEquals("BlanksquareOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
    assert.fieldEquals(
      "BlanksquareOperationStats",
      `${PROTOCOL_STATS_ID}-${OPERATION_ID}`,
      "totalValue",
      VALUE.toString(),
    );
  });

  test("Withdraw stats updated", () => {
    assert.fieldEquals("BlanksquareWithdrawStats", WITHDRAW_STATS_ID, "totalCount", "1");
    assert.fieldEquals("BlanksquareWithdrawStats", WITHDRAW_STATS_ID, "totalGasUsed", "1");
    assert.fieldEquals("BlanksquareWithdrawStats", WITHDRAW_STATS_ID, "totalValue", VALUE.toString());
  });
});
