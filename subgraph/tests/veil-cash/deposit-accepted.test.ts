import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleDepositAccepted } from "../../src/veil-cash/veil-eth-queue-v3";

import { PROTOCOL_STATS_ID, createDepositAcceptedEvent } from "./utils";

const OPERATION_ID = "deposit-accepted";
const DEPOSIT_ACCEPTED_STATS_ID = "veil-cash-deposit-accepted-native-eth";

const NONCE = BigInt.fromI32(8);
const OPERATOR = Address.fromString("0x0000000000000000000000000000000000000008");
const VEIL_ENTRY = Address.fromString("0x0000000000000000000000000000000000000009");
const VALUE = BigInt.fromI32(100);

describe("VeilETHQueueV3 deposit accepted event tests", () => {
  beforeAll(() => {
    const event = createDepositAcceptedEvent(NONCE, OPERATOR, VEIL_ENTRY, VALUE);

    handleDepositAccepted(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("VeilCashDepositAccepted created", () => {
    assert.entityCount("VeilCashDepositAccepted", 1);
  });

  test("VeilCashDepositAccepted values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("VeilCashDepositAccepted", id, "nonce", NONCE.toString());
    assert.fieldEquals("VeilCashDepositAccepted", id, "operator", OPERATOR.toHexString());
    assert.fieldEquals("VeilCashDepositAccepted", id, "veilEntry", VEIL_ENTRY.toHexString());
    assert.fieldEquals("VeilCashDepositAccepted", id, "value", VALUE.toString());
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("VeilCashProtocolStats", PROTOCOL_STATS_ID, "totalTxCount", "1");
    assert.fieldEquals("VeilCashProtocolStats", PROTOCOL_STATS_ID, "totalGasUsed", "1");
  });

  test("Operation stats updated (deposit accepted)", () => {
    assert.fieldEquals("VeilCashOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalCount", "1");
    assert.fieldEquals("VeilCashOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
  });

  test("Deposit accepted stats updated", () => {
    assert.fieldEquals("VeilCashDepositAcceptedStats", DEPOSIT_ACCEPTED_STATS_ID, "totalCount", "1");
    assert.fieldEquals("VeilCashDepositAcceptedStats", DEPOSIT_ACCEPTED_STATS_ID, "totalGasUsed", "1");
    assert.fieldEquals("VeilCashDepositAcceptedStats", DEPOSIT_ACCEPTED_STATS_ID, "totalValue", VALUE.toString());
  });
});
