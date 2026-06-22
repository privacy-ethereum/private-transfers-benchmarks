import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, afterAll, describe, beforeAll, clearStore, test } from "matchstick-as/assembly/index";

import { handleTransfer } from "../../src/worm/beth";
import { BETH_TO_ETH_CONTRACT } from "../../src/worm/utils";

import { createTransferEventWithDummyLog, createTransferEventWithWithdrawLog } from "./utils";

const WITHDRAW_TRANSACTION_HASH = Bytes.fromHexString("0xa16081f360e3847006db660bae1c6d1b2e17ec2a");
const TRANSFER_FROM = Address.fromString("0x0000000000000000000000000000000000000001");
const TRANSFER_TO = Address.fromString("0x0000000000000000000000000000000000000002");
const TRANSFER_VALUE = BigInt.fromI32(100);
const WITHDRAW_WAD = BigInt.fromI32(1000);

const PROTOCOL_ID = "worm-protocol-stats";
const WITHDRAW_OPERATION_ID = `${PROTOCOL_ID}-withdraw`;

describe("WORM withdraw tests", () => {
  describe("1 event 1 tx", () => {
    beforeAll(() => {
      const event = createTransferEventWithWithdrawLog(
        WITHDRAW_TRANSACTION_HASH,
        TRANSFER_FROM,
        TRANSFER_TO,
        TRANSFER_VALUE,
        BETH_TO_ETH_CONTRACT,
        WITHDRAW_WAD,
      );

      handleTransfer(event);
    });

    afterAll(() => {
      clearStore();
    });

    test("WormWithdraw created", () => {
      assert.entityCount("WormWithdraw", 1);
    });

    test("WormWithdraw values stored correctly", () => {
      const id = WITHDRAW_TRANSACTION_HASH.toHexString();

      assert.fieldEquals("WormWithdraw", id, "value", WITHDRAW_WAD.toString());
      assert.fieldEquals("WormWithdraw", id, "txHash", WITHDRAW_TRANSACTION_HASH.toHexString());
      assert.fieldEquals("WormWithdraw", id, "gasUsed", "1");
      assert.fieldEquals("WormWithdraw", id, "gasPrice", "1");
    });

    test("Protocol stats updated", () => {
      assert.fieldEquals("WormProtocolStats", PROTOCOL_ID, "totalTxCount", "1");
      assert.fieldEquals("WormProtocolStats", PROTOCOL_ID, "totalGasUsed", "1");
    });

    test("Withdraw operation stats updated", () => {
      assert.fieldEquals("WormWithdrawStats", WITHDRAW_OPERATION_ID, "totalCount", "1");
      assert.fieldEquals("WormWithdrawStats", WITHDRAW_OPERATION_ID, "totalGasUsed", "1");
      assert.fieldEquals("WormWithdrawStats", WITHDRAW_OPERATION_ID, "totalValue", WITHDRAW_WAD.toString());
    });
  });

  describe("2 events 1 tx", () => {
    beforeAll(() => {
      const event1 = createTransferEventWithWithdrawLog(
        WITHDRAW_TRANSACTION_HASH,
        TRANSFER_FROM,
        TRANSFER_TO,
        TRANSFER_VALUE,
        BETH_TO_ETH_CONTRACT,
        WITHDRAW_WAD,
      );

      const event2 = createTransferEventWithWithdrawLog(
        WITHDRAW_TRANSACTION_HASH,
        TRANSFER_FROM,
        TRANSFER_TO,
        TRANSFER_VALUE,
        BETH_TO_ETH_CONTRACT,
        WITHDRAW_WAD,
      );

      handleTransfer(event1);
      handleTransfer(event2);
    });

    afterAll(() => {
      clearStore();
    });

    test("Only one WormWithdraw created", () => {
      assert.entityCount("WormWithdraw", 1);
    });

    test("Protocol stats updated only once", () => {
      assert.fieldEquals("WormProtocolStats", PROTOCOL_ID, "totalTxCount", "1");
      assert.fieldEquals("WormProtocolStats", PROTOCOL_ID, "totalGasUsed", "1");
    });

    test("Withdraw operation stats updated only once", () => {
      assert.fieldEquals("WormWithdrawStats", WITHDRAW_OPERATION_ID, "totalCount", "1");
      assert.fieldEquals("WormWithdrawStats", WITHDRAW_OPERATION_ID, "totalGasUsed", "1");
      assert.fieldEquals("WormWithdrawStats", WITHDRAW_OPERATION_ID, "totalValue", WITHDRAW_WAD.toString());
    });
  });

  describe("2 events 2 txs", () => {
    beforeAll(() => {
      const event1 = createTransferEventWithWithdrawLog(
        WITHDRAW_TRANSACTION_HASH,
        TRANSFER_FROM,
        TRANSFER_TO,
        TRANSFER_VALUE,
        BETH_TO_ETH_CONTRACT,
        WITHDRAW_WAD,
      );

      const event2 = createTransferEventWithWithdrawLog(
        Bytes.fromHexString("0xb16081f360e3847006db660bae1c6d1b2e17ec3b"),
        TRANSFER_FROM,
        TRANSFER_TO,
        TRANSFER_VALUE,
        BETH_TO_ETH_CONTRACT,
        WITHDRAW_WAD,
      );

      handleTransfer(event1);
      handleTransfer(event2);
    });

    afterAll(() => {
      clearStore();
    });

    test("Two WormWithdraw created", () => {
      assert.entityCount("WormWithdraw", 2);
    });

    test("Protocol stats updated twice", () => {
      assert.fieldEquals("WormProtocolStats", PROTOCOL_ID, "totalTxCount", "2");
      assert.fieldEquals("WormProtocolStats", PROTOCOL_ID, "totalGasUsed", "2");
    });

    test("Withdraw operation stats updated twice", () => {
      const value = WITHDRAW_WAD.plus(WITHDRAW_WAD);

      assert.fieldEquals("WormWithdrawStats", WITHDRAW_OPERATION_ID, "totalCount", "2");
      assert.fieldEquals("WormWithdrawStats", WITHDRAW_OPERATION_ID, "totalGasUsed", "2");
      assert.fieldEquals("WormWithdrawStats", WITHDRAW_OPERATION_ID, "totalValue", value.toString());
    });
  });

  describe("No withdraw event", () => {
    beforeAll(() => {
      const event = createTransferEventWithDummyLog(
        WITHDRAW_TRANSACTION_HASH,
        TRANSFER_FROM,
        TRANSFER_TO,
        TRANSFER_VALUE,
      );

      handleTransfer(event);
    });

    afterAll(() => {
      clearStore();
    });

    test("No WormWithdraw created", () => {
      assert.entityCount("WormWithdraw", 0);
    });

    test("Protocol stats not updated", () => {
      assert.entityCount("WormProtocolStats", 0);
    });

    test("Withdraw operation stats not updated", () => {
      assert.entityCount("WormWithdrawStats", 0);
    });
  });
});
