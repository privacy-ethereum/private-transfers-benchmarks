import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleDeposit } from "../../src/blanksquare/shielder";

import { createDepositEvent } from "./utils";

const PROTOCOL_STATS_ID = "blanksquare-protocol-stats";
const OPERATION_ID = "deposit";
const DEPOSIT_STATS_ID = "blanksquare-deposit-native-eth";

const TOKEN_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000");
const VALUE = BigInt.fromI32(100);

describe("Shielder deposit event tests", () => {
  beforeAll(() => {
    const event = createDepositEvent(TOKEN_ADDRESS, VALUE);

    handleDeposit(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("BlanksquareDeposit created", () => {
    assert.entityCount("BlanksquareDeposit", 1);
  });

  test("BlanksquareDeposit values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("BlanksquareDeposit", id, "value", VALUE.toString());
    assert.fieldEquals("BlanksquareDeposit", id, "tokenAddress", TOKEN_ADDRESS.toHexString());
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("BlanksquareProtocolStats", PROTOCOL_STATS_ID, "totalTxCount", "1");
    assert.fieldEquals("BlanksquareProtocolStats", PROTOCOL_STATS_ID, "totalGasUsed", "1");
  });

  test("Operation stats updated (deposit)", () => {
    assert.fieldEquals("BlanksquareOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalCount", "1");
    assert.fieldEquals("BlanksquareOperationStats", `${PROTOCOL_STATS_ID}-${OPERATION_ID}`, "totalGasUsed", "1");
    assert.fieldEquals(
      "BlanksquareOperationStats",
      `${PROTOCOL_STATS_ID}-${OPERATION_ID}`,
      "totalValue",
      VALUE.toString(),
    );
  });

  test("Deposit stats updated", () => {
    assert.fieldEquals("BlanksquareDepositStats", DEPOSIT_STATS_ID, "totalCount", "1");
    assert.fieldEquals("BlanksquareDepositStats", DEPOSIT_STATS_ID, "totalGasUsed", "1");
    assert.fieldEquals("BlanksquareDepositStats", DEPOSIT_STATS_ID, "totalValue", VALUE.toString());
  });
});
