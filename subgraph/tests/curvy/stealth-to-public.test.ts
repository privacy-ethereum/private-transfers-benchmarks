import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as";

import { handleWithdraw } from "../../src/curvy/curvy-vault-v6";

import { createWithdrawEvent } from "./utils";

const TRANSACTION_SENDER = "0x0000000000000000000000000000000000000001";
const TOKEN_ADDRESS = "0x0000000000000000000000000000000000000002";
const TRANSACTION_RECEIVER = "0x0000000000000000000000000000000000000003";
const AMOUNT = BigInt.fromI32(1000);

const PROTOCOL_ID = "curvy-protocol-stats";
const OPERATION_ID = `${PROTOCOL_ID}-stealth-to-public`;

describe("Curvy Smart Account Relayer Stealth to Public event tests", () => {
  beforeAll(() => {
    const from = Address.fromString(TRANSACTION_SENDER);
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const receiver = Address.fromString(TRANSACTION_RECEIVER);

    const event = createWithdrawEvent(from, tokenAddress, receiver, AMOUNT);

    handleWithdraw(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("CurvyWithdraw created", () => {
    assert.entityCount("CurvyWithdraw", 1);
  });

  test("CurvyWithdraw values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("CurvyWithdraw", id, "from", TRANSACTION_SENDER);
    assert.fieldEquals("CurvyWithdraw", id, "tokenAddress", TOKEN_ADDRESS);
    assert.fieldEquals("CurvyWithdraw", id, "to", TRANSACTION_RECEIVER);
    assert.fieldEquals("CurvyWithdraw", id, "amount", AMOUNT.toString());
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("CurvyProtocolStats", PROTOCOL_ID, "totalTxCount", "1");
  });

  test("Operation stats updated (stealthToPublic)", () => {
    assert.fieldEquals("CurvyOperationStats", OPERATION_ID, "totalCount", "1");
  });

  test("Stealth to Public stats updated", () => {
    const id = OPERATION_ID;

    assert.entityCount("CurvyStealthToPublicStats", 1);
    assert.fieldEquals("CurvyStealthToPublicStats", id, "totalCount", "1");
    assert.fieldEquals("CurvyStealthToPublicStats", id, "totalGasUsed", "1");
  });
});
