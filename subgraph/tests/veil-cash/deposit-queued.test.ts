import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleDepositQueued } from "../../src/veil-cash/veil-eth-queue-v3";

import { PROTOCOL_STATS_ID, createDepositQueuedEvent } from "./utils";

const OPERATION_ID = "deposit-queued";
const DEPOSIT_QUEUED_STATS_ID = "veil-cash-deposit-queued-native-eth";

const NONCE = BigInt.fromI32(7);
const SENDER = Address.fromString("0x0000000000000000000000000000000000000007");
const VALUE = BigInt.fromI32(100);
const DEPOSIT_KEY = Bytes.fromHexString("0x1234");

describe("VeilETHQueueV3 deposit queued event tests", () => {
  beforeAll(() => {
    const event = createDepositQueuedEvent(NONCE, SENDER, VALUE, DEPOSIT_KEY);

    handleDepositQueued(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("VeilCashDepositQueued created", () => {
    assert.entityCount("VeilCashDepositQueued", 1);
  });

  test("VeilCashDepositQueued values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("VeilCashDepositQueued", id, "nonce", NONCE.toString());
    assert.fieldEquals("VeilCashDepositQueued", id, "sender", SENDER.toHexString());
    assert.fieldEquals("VeilCashDepositQueued", id, "depositKey", DEPOSIT_KEY.toHexString());
    assert.fieldEquals("VeilCashDepositQueued", id, "value", VALUE.toString());
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("VeilCashProtocolStats", PROTOCOL_STATS_ID, "totalTxCount", "1");
    assert.fieldEquals("VeilCashProtocolStats", PROTOCOL_STATS_ID, "totalGasUsed", "1");
  });

  test("Operation stats updated (deposit queued)", () => {
    assert.fieldEquals("VeilCashOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalCount", "1");
    assert.fieldEquals("VeilCashOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
  });

  test("Deposit queued stats updated", () => {
    assert.fieldEquals("VeilCashDepositQueuedStats", DEPOSIT_QUEUED_STATS_ID, "totalCount", "1");
    assert.fieldEquals("VeilCashDepositQueuedStats", DEPOSIT_QUEUED_STATS_ID, "totalGasUsed", "1");
    assert.fieldEquals("VeilCashDepositQueuedStats", DEPOSIT_QUEUED_STATS_ID, "totalValue", VALUE.toString());
  });
});
