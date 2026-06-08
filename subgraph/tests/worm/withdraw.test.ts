import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, afterAll, describe, beforeAll, clearStore, test } from "matchstick-as/assembly/index";

import { handleSwapBethWithEth } from "../../src/worm/beth-to-eth";

import { createSwapBethWithEthCall } from "./utils";

const WITHDRAW_TRANSACTION_HASH = Bytes.fromHexString("0xa16081f360e3847006db660bae1c6d1b2e17ec2a");
const AMOUNT = BigInt.fromI32(1000);
const RECIPIENT = Address.fromString("0x0000000000000000000000000000000000000001");

const PROTOCOL_ID = "worm-protocol-stats";
const WITHDRAW_OPERATION_ID = `${PROTOCOL_ID}-withdraw`;

describe("WORM withdraw tests", () => {
  describe("1 event 1 tx", () => {
    beforeAll(() => {
      const event = createSwapBethWithEthCall(WITHDRAW_TRANSACTION_HASH, AMOUNT, RECIPIENT);

      handleSwapBethWithEth(event);
    });

    afterAll(() => {
      clearStore();
    });

    test("WormWithdraw created", () => {
      assert.entityCount("WormWithdraw", 1);
    });

    test("WormWithdraw values stored correctly", () => {
      const id = WITHDRAW_TRANSACTION_HASH.toHexString();

      assert.fieldEquals("WormWithdraw", id, "value", AMOUNT.toString());
      assert.fieldEquals("WormWithdraw", id, "txHash", WITHDRAW_TRANSACTION_HASH.toHexString());
    });

    test("Protocol stats updated", () => {
      assert.fieldEquals("WormProtocolStats", PROTOCOL_ID, "totalTxCount", "1");
    });

    test("Withdraw operation stats updated", () => {
      assert.fieldEquals("WormOperationStats", WITHDRAW_OPERATION_ID, "totalCount", "1");
    });
  });

  describe("2 events 1 tx", () => {
    beforeAll(() => {
      const call1 = createSwapBethWithEthCall(WITHDRAW_TRANSACTION_HASH, AMOUNT, RECIPIENT);
      const call2 = createSwapBethWithEthCall(WITHDRAW_TRANSACTION_HASH, AMOUNT, RECIPIENT);

      handleSwapBethWithEth(call1);
      handleSwapBethWithEth(call2);
    });

    afterAll(() => {
      clearStore();
    });

    test("Only one WormWithdraw created", () => {
      assert.entityCount("WormWithdraw", 1);
    });

    test("Protocol stats updated only once", () => {
      assert.fieldEquals("WormProtocolStats", PROTOCOL_ID, "totalTxCount", "1");
    });

    test("Withdraw operation stats updated only once", () => {
      assert.fieldEquals("WormOperationStats", WITHDRAW_OPERATION_ID, "totalCount", "1");
    });
  });

  describe("2 events 2 txs", () => {
    beforeAll(() => {
      const call1 = createSwapBethWithEthCall(WITHDRAW_TRANSACTION_HASH, AMOUNT, RECIPIENT);
      const call2 = createSwapBethWithEthCall(
        Bytes.fromHexString("0xb16081f360e3847006db660bae1c6d1b2e17ec3b"),
        AMOUNT,
        RECIPIENT,
      );

      handleSwapBethWithEth(call1);
      handleSwapBethWithEth(call2);
    });

    afterAll(() => {
      clearStore();
    });

    test("Two WormWithdraw created", () => {
      assert.entityCount("WormWithdraw", 2);
    });

    test("Protocol stats updated twice", () => {
      assert.fieldEquals("WormProtocolStats", PROTOCOL_ID, "totalTxCount", "2");
    });

    test("Withdraw operation stats updated twice", () => {
      assert.fieldEquals("WormOperationStats", WITHDRAW_OPERATION_ID, "totalCount", "2");
    });
  });
});
