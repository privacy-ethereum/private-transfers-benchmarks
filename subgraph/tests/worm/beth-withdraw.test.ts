import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleTransfer } from "../../src/worm/beth";

import { createTransferEvent } from "./utils";

const WITHDRAW_TRANSACTION_HASH = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a";
const RECEIVER = "0x0000000000000000000000000000000000000001";
const AMOUNT = BigInt.fromI32(1000);

const PROTOCOL_ID = "worm-protocol-stats";
const WITHDRAW_OPERATION_ID = `${PROTOCOL_ID}-withdraw`;

describe("WORM withdraw tests (1 event 1 tx)", () => {
  beforeAll(() => {
    const event = createTransferEvent(
      Bytes.fromHexString(WITHDRAW_TRANSACTION_HASH),
      Address.fromString(RECEIVER),
      AMOUNT,
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
    const id = WITHDRAW_TRANSACTION_HASH;

    assert.fieldEquals("WormWithdraw", id, "to", RECEIVER);
    assert.fieldEquals("WormWithdraw", id, "value", AMOUNT.toString());
    assert.fieldEquals("WormWithdraw", id, "txHash", WITHDRAW_TRANSACTION_HASH);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("WormProtocolStats", PROTOCOL_ID, "totalTxCount", "1");
  });

  test("Withdraw operation stats updated", () => {
    assert.fieldEquals("WormOperationStats", WITHDRAW_OPERATION_ID, "totalCount", "1");
  });
});

describe("WORM withdraw tests (2 events 1 tx)", () => {
  beforeAll(() => {
    const event1 = createTransferEvent(
      Bytes.fromHexString(WITHDRAW_TRANSACTION_HASH),
      Address.fromString(RECEIVER),
      AMOUNT,
    );

    const event2 = createTransferEvent(
      Bytes.fromHexString(WITHDRAW_TRANSACTION_HASH),
      Address.fromString(RECEIVER),
      AMOUNT,
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
  });

  test("Withdraw operation stats updated only once", () => {
    assert.fieldEquals("WormOperationStats", WITHDRAW_OPERATION_ID, "totalCount", "1");
  });
});

describe("WORM withdraw tests (2 events 2 txs)", () => {
  beforeAll(() => {
    const event1 = createTransferEvent(
      Bytes.fromHexString(WITHDRAW_TRANSACTION_HASH),
      Address.fromString(RECEIVER),
      AMOUNT,
    );

    const event2 = createTransferEvent(
      Bytes.fromHexString("0xb16081f360e3847006db660bae1c6d1b2e17ec2a"),
      Address.fromString(RECEIVER),
      AMOUNT,
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
  });

  test("Withdraw operation stats updated twice", () => {
    assert.fieldEquals("WormOperationStats", WITHDRAW_OPERATION_ID, "totalCount", "2");
  });
});
