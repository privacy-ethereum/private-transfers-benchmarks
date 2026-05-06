import { Address } from "@graphprotocol/graph-ts";
import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";

import { handlePoolRegistered, handlePoolRemoved } from "../../src/privacy-pools/privacy-pools";

import { createPoolRegisteredEvent, createPoolRemovedEvent } from "./privacy-pools-utils";

describe("Pool events tests", () => {
  beforeAll(() => {
    const pool = Address.fromString("0x0000000000000000000000000000000000000001");
    const asset = Address.fromString("0x0000000000000000000000000000000000000002");

    const registerEvent = createPoolRegisteredEvent(pool, asset);
    handlePoolRegistered(registerEvent);

    const removeEvent = createPoolRemovedEvent(pool, asset);
    handlePoolRemoved(removeEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("Pool registered", () => {
    const id = "0x0000000000000000000000000000000000000001";

    assert.entityCount("PrivacyPoolsPool", 0);
    assert.notInStore("PrivacyPoolsPool", id);
  });

  test("Pool removed", () => {
    const id = "0x0000000000000000000000000000000000000001";

    assert.notInStore("PrivacyPoolsPool", id);
  });
});
