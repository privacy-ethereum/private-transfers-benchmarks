import { Bytes } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleNewNullifier } from "../../src/veil-cash/veil-eth-pool";

import { PROTOCOL_STATS_ID, createNewNullifierEvent } from "./utils";

const OPERATION_ID = "transfer";
const TRANSFER_STATS_ID = "veil-cash-transfer-native-eth";
const TRANSFER_HASH = Bytes.fromHexString("0xa16081f360e3847006db660bae1c6d1b2e17ec2a");

describe("VeilETHPool transfer tests", () => {
  describe("withdrawETH tx with nullifier", () => {
    beforeAll(() => {
      const event = createNewNullifierEvent(TRANSFER_HASH);

      handleNewNullifier(event);
    });

    afterAll(() => {
      clearStore();
    });

    test("VeilCashTransfer created", () => {
      assert.entityCount("VeilCashTransfer", 1);
    });

    test("Protocol stats updated", () => {
      assert.fieldEquals("VeilCashProtocolStats", PROTOCOL_STATS_ID, "totalTxCount", "1");
      assert.fieldEquals("VeilCashProtocolStats", PROTOCOL_STATS_ID, "totalGasUsed", "1");
    });

    test("Operation stats updated (transfer)", () => {
      assert.fieldEquals("VeilCashOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalCount", "1");
      assert.fieldEquals("VeilCashOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
    });

    test("Transfer stats updated", () => {
      assert.fieldEquals("VeilCashTransferStats", TRANSFER_STATS_ID, "totalCount", "1");
      assert.fieldEquals("VeilCashTransferStats", TRANSFER_STATS_ID, "totalGasUsed", "1");
      assert.fieldEquals("VeilCashTransferStats", TRANSFER_STATS_ID, "totalValue", "0");
    });
  });

  describe("multiple nullifiers in same tx", () => {
    beforeAll(() => {
      const event1 = createNewNullifierEvent(TRANSFER_HASH);
      const event2 = createNewNullifierEvent(TRANSFER_HASH);

      handleNewNullifier(event1);
      handleNewNullifier(event2);
    });

    afterAll(() => {
      clearStore();
    });

    test("Only one VeilCashTransfer created", () => {
      assert.entityCount("VeilCashTransfer", 1);
    });

    test("Transfer stats updated only once", () => {
      assert.fieldEquals("VeilCashTransferStats", TRANSFER_STATS_ID, "totalCount", "1");
    });
  });
});
