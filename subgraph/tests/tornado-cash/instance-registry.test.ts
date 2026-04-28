import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handleInstanceStateUpdated } from "../../src/tornado-cash/instance-registry";

import { createInstanceStateUpdatedEvent } from "./instance-registry-utils";

describe("InstanceStateUpdated event tests", () => {
  const id = "0x0000000000000000000000000000000000000001";

  beforeAll(() => {
    const event = createInstanceStateUpdatedEvent(Address.fromString(id), BigInt.fromI32(1));

    handleInstanceStateUpdated(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("TornadoCashInstance created", () => {
    assert.entityCount("TornadoCashInstance", 1);

    assert.fieldEquals("TornadoCashInstance", id, "address", id);
    assert.fieldEquals("TornadoCashInstance", id, "active", "true");
  });

  test("TornadoCashInstance disable", () => {
    const event = createInstanceStateUpdatedEvent(Address.fromString(id), BigInt.fromI32(0));

    handleInstanceStateUpdated(event);

    assert.entityCount("TornadoCashInstance", 1);

    assert.fieldEquals("TornadoCashInstance", id, "address", id);
    assert.fieldEquals("TornadoCashInstance", id, "active", "false");
  });

  test("TornadoCashInstance enable", () => {
    const event = createInstanceStateUpdatedEvent(Address.fromString(id), BigInt.fromI32(1));

    handleInstanceStateUpdated(event);

    assert.entityCount("TornadoCashInstance", 1);

    assert.fieldEquals("TornadoCashInstance", id, "address", id);
    assert.fieldEquals("TornadoCashInstance", id, "active", "true");
  });
});
