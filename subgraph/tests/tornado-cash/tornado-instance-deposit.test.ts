import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleInstanceStateUpdated } from "../../src/tornado-cash/instance-registry";
import { handleDeposit } from "../../src/tornado-cash/tornado-instance";

import { createInstanceStateUpdatedEvent } from "./instance-registry-utils";
import { createDepositEvent } from "./tornado-instance-utils";

describe("Deposit event tests", () => {
  beforeAll(() => {
    const instanceAddress = Address.fromString("0x0000000000000000000000000000000000000001");

    const instanceEvent = createInstanceStateUpdatedEvent(instanceAddress, BigInt.fromI32(1));

    handleInstanceStateUpdated(instanceEvent);

    const depositEvent = createDepositEvent(
      instanceAddress,
      Bytes.fromHexString("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
      1,
      BigInt.fromI32(1000),
      BigInt.fromI32(1),
    );

    handleDeposit(depositEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("TornadoCashDeposit created", () => {
    assert.entityCount("TornadoCashDeposit", 1);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("TornadoCashProtocolStats", "tornado-protocol-stats", "totalTxCount", "1");
  });

  test("Shield token stats updated", () => {
    assert.entityCount("TornadoCashOperationStats", 2);
    assert.fieldEquals("TornadoCashOperationStats", "tornado-shield", "totalValue", "1");
    assert.fieldEquals("TornadoCashOperationStats", "tornado-shield", "totalCount", "1");
    assert.fieldEquals("TornadoCashOperationStats", "tornado-shield", "totalGasUsed", "1");
  });

  test("Operation stats updated (shield)", () => {
    assert.fieldEquals("TornadoCashOperationStats", "tornado-shield", "totalCount", "1");
  });
});
