import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, afterAll, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleOperationRelayed } from "../../src/fluidkey/smart-account-relayer";

import { createOperationRelayedEvent } from "./utils";

const TRANSACTION_SENDER = "0x0000000000000000000000000000000000000001";

const PROTOCOL_ID = "fluidkey-protocol-stats";
const OPERATION_ID = `${PROTOCOL_ID}-stealth-to-public`;

describe("Fluidkey Smart Account Relayer Stealth to Public event tests", () => {
  beforeAll(() => {
    const sender = Address.fromString(TRANSACTION_SENDER);
    const operationId = BigInt.fromI32(1);

    const successEvent = createOperationRelayedEvent(sender, operationId, true);
    const failureEvent = createOperationRelayedEvent(sender, operationId, false);

    handleOperationRelayed(successEvent);
    handleOperationRelayed(failureEvent); // only sucess are counted
  });

  afterAll(() => {
    clearStore();
  });

  test("FluidkeyOperationRelayed created", () => {
    assert.entityCount("FluidkeyOperationRelayed", 1);
  });

  test("FluidkeyOperationRelayed values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("FluidkeyOperationRelayed", id, "from", TRANSACTION_SENDER);
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("FluidkeyProtocolStats", PROTOCOL_ID, "totalTxCount", "1");
  });

  test("Operation stats updated (stealthToPublic)", () => {
    assert.fieldEquals("FluidkeyOperationStats", OPERATION_ID, "totalCount", "1");
  });

  test("Stealth to Public stats updated", () => {
    const id = OPERATION_ID;

    assert.entityCount("FluidkeyStealthToPublicStats", 1);
    assert.fieldEquals("FluidkeyStealthToPublicStats", id, "totalCount", "1");
    assert.fieldEquals("FluidkeyStealthToPublicStats", id, "totalGasUsed", "1");
  });
});
