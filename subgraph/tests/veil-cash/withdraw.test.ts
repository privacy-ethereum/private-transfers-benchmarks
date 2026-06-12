import { Bytes } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleNewNullifier } from "../../src/veil-cash/veil-eth-pool";

import { createWithdrawEvent, PROTOCOL_STATS_ID, WITHDRAW_AMOUNT } from "./utils";

const OPERATION_ID = "withdraw";
const WITHDRAW_STATS_ID = "veil-cash-withdraw-native-eth";
const WITHDRAW_HASH = Bytes.fromHexString("0xa16081f360e3847006db660bae1c6d1b2e17ec2b");

describe("VeilETHPool withdraw tests", () => {
  describe("withdrawETH tx with nullifier", () => {
    beforeAll(() => {
      const event = createWithdrawEvent(WITHDRAW_HASH);

      handleNewNullifier(event);
    });

    afterAll(() => {
      clearStore();
    });

    test("VeilCashWithdraw created", () => {
      assert.entityCount("VeilCashWithdraw", 1);
    });

    test("VeilCashWithdraw values stored correctly", () => {
      const id = WITHDRAW_HASH.toHexString();

      assert.fieldEquals("VeilCashWithdraw", id, "txHash", WITHDRAW_HASH.toHexString());
      assert.fieldEquals("VeilCashWithdraw", id, "value", WITHDRAW_AMOUNT.toI32().toString());
      assert.fieldEquals("VeilCashWithdraw", id, "gasUsed", "1");
      assert.fieldEquals("VeilCashWithdraw", id, "gasPrice", "1");
    });

    test("Protocol stats updated", () => {
      assert.fieldEquals("VeilCashProtocolStats", PROTOCOL_STATS_ID, "totalTxCount", "1");
      assert.fieldEquals("VeilCashProtocolStats", PROTOCOL_STATS_ID, "totalGasUsed", "1");
    });

    test("Operation stats updated (withdraw)", () => {
      assert.fieldEquals("VeilCashOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalCount", "1");
      assert.fieldEquals("VeilCashOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
    });

    test("Withdraw stats updated", () => {
      assert.fieldEquals("VeilCashWithdrawStats", WITHDRAW_STATS_ID, "totalCount", "1");
      assert.fieldEquals("VeilCashWithdrawStats", WITHDRAW_STATS_ID, "totalGasUsed", "1");
      assert.fieldEquals("VeilCashWithdrawStats", WITHDRAW_STATS_ID, "totalValue", WITHDRAW_AMOUNT.toI32().toString());
    });
  });

  describe("multiple nullifiers in same tx", () => {
    beforeAll(() => {
      const event1 = createWithdrawEvent(WITHDRAW_HASH);
      const event2 = createWithdrawEvent(WITHDRAW_HASH);

      handleNewNullifier(event1);
      handleNewNullifier(event2);
    });

    afterAll(() => {
      clearStore();
    });

    test("Only one VeilCashWithdraw created", () => {
      assert.entityCount("VeilCashWithdraw", 1);
    });

    test("Withdraw stats updated only once", () => {
      assert.fieldEquals("VeilCashWithdrawStats", WITHDRAW_STATS_ID, "totalCount", "1");
    });
  });
});
