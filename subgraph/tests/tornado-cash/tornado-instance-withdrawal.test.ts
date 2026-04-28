import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  createMockedFunction,
} from "matchstick-as/assembly/index";

import { handleInstanceStateUpdated } from "../../src/tornado-cash/instance-registry";
import { handleWithdrawal } from "../../src/tornado-cash/tornado-instance";

import { createInstanceStateUpdatedEvent } from "./instance-registry-utils";
import { createWithdrawalEvent } from "./tornado-instance-utils";

describe("Withdrawal event tests", () => {
  beforeAll(() => {
    const instanceAddress = Address.fromString("0x0000000000000000000000000000000000000001");

    createMockedFunction(instanceAddress, "denomination", "denomination():(uint256)").returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("1")),
    ]);

    const instanceEvent = createInstanceStateUpdatedEvent(instanceAddress, BigInt.fromI32(1));

    handleInstanceStateUpdated(instanceEvent);

    const withdrawalEvent = createWithdrawalEvent(
      instanceAddress,
      Address.zero(),
      Bytes.fromHexString("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
      Address.zero(),
      BigInt.fromI32(2),
    );

    handleWithdrawal(withdrawalEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("TornadoCashWithdrawal created", () => {
    assert.entityCount("TornadoCashWithdrawal", 1);
  });

  test("Unshield token stats updated", () => {
    assert.entityCount("TornadoCashOperationStats", 2);
    assert.fieldEquals("TornadoCashOperationStats", "tornado-unshield", "totalValue", "1");
    assert.fieldEquals("TornadoCashOperationStats", "tornado-unshield", "totalCount", "1");
    assert.fieldEquals("TornadoCashOperationStats", "tornado-unshield", "totalGasUsed", "1");
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("TornadoCashProtocolStats", "tornado-protocol-stats", "totalTxCount", "1");
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("TornadoCashProtocolStats", "tornado-protocol-stats", "totalTxCount", "1");
  });

  test("Operation stats updated (unshield)", () => {
    assert.fieldEquals("TornadoCashOperationStats", "tornado-unshield", "totalCount", "1");
  });
});
