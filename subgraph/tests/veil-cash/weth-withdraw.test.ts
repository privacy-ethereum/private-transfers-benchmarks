import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleWithdrawal } from "../../src/veil-cash/weth";

import { PROTOCOL_STATS_ID, VEIL_ETH_POOL_ADDRESS, createWithdrawalEvent } from "./utils";

const OPERATION_ID = "withdraw";
const WITHDRAW_STATS_ID = "veil-cash-withdraw-native-eth";

const WITHDRAW_HASH = Bytes.fromHexString("0xa16081f360e3847006db660bae1c6d1b2e17ec2a");
const SRC = Address.fromString("0x000000000000000000000000000000000000000a");
const VALUE = BigInt.fromI32(100);

describe("WETH withdraw event tests", () => {
  beforeAll(() => {
    const event = createWithdrawalEvent(WITHDRAW_HASH, VEIL_ETH_POOL_ADDRESS, SRC, VALUE);

    handleWithdrawal(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("VeilCashWithdraw created", () => {
    assert.entityCount("VeilCashWithdraw", 1);
  });

  test("VeilCashWithdraw values stored correctly", () => {
    const id = WITHDRAW_HASH.toHexString();

    assert.fieldEquals("VeilCashWithdraw", id, "value", VALUE.toString());
    assert.fieldEquals("VeilCashWithdraw", id, "txHash", WITHDRAW_HASH.toHexString());
    assert.fieldEquals("VeilCashWithdraw", id, "gasUsed", "1");
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
    assert.fieldEquals("VeilCashWithdrawStats", WITHDRAW_STATS_ID, "totalValue", VALUE.toString());
  });
});
