import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { createMockedFunction } from "matchstick-as";
import { afterAll, assert, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";

import { handleDeposit } from "../../src/intmax/liquidity-v2";

import { createDepositEvent } from "./utils";

const TOKEN_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000001");
const SENDER = Address.fromString("0x0000000000000000000000000000000000000002");

describe("Intmax deposit event tests", () => {
  beforeAll(() => {
    const event = createDepositEvent(BigInt.fromI32(1), SENDER, 1, BigInt.fromI32(100), true);

    createMockedFunction(event.address, "getTokenInfo", "getTokenInfo(uint32):((uint8,address,uint256))")
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
      .returns([
        ethereum.Value.fromTuple(
          changetype<ethereum.Tuple>([
            ethereum.Value.fromUnsignedBigInt(BigInt.zero()),
            ethereum.Value.fromAddress(TOKEN_ADDRESS),
            ethereum.Value.fromUnsignedBigInt(BigInt.zero()),
          ]),
        ),
      ]);

    handleDeposit(event);
  });

  afterAll(() => {
    clearStore();
  });

  test("IntmaxMainnetDeposit created", () => {
    assert.entityCount("IntmaxMainnetDeposit", 1);
  });

  test("IntmaxMainnetDeposit values stored correctly", () => {
    const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";

    assert.fieldEquals("IntmaxMainnetDeposit", id, "amount", "100");
    assert.fieldEquals("IntmaxMainnetDeposit", id, "tokenIndex", "1");
    assert.fieldEquals("IntmaxMainnetDeposit", id, "tokenAddress", TOKEN_ADDRESS.toHexString());
    assert.fieldEquals("IntmaxMainnetDeposit", id, "txHash", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a");
  });

  test("Protocol stats updated", () => {
    assert.fieldEquals("IntmaxMainnetProtocolStats", "intmax-protocol-stats", "totalTxCount", "1");
    assert.fieldEquals("IntmaxMainnetProtocolStats", "intmax-protocol-stats", "totalGasUsed", "1");
  });

  test("Operation stats updated (deposit)", () => {
    assert.fieldEquals("IntmaxMainnetOperationStats", "intmax-protocol-stats-deposit", "totalCount", "1");
    assert.fieldEquals("IntmaxMainnetOperationStats", "intmax-protocol-stats-deposit", "totalGasUsed", "1");
  });

  test("Deposit stats updated", () => {
    const id = `intmax-deposit-${TOKEN_ADDRESS.toHexString()}`;

    assert.fieldEquals("IntmaxMainnetDepositStats", id, "totalCount", "1");
    assert.fieldEquals("IntmaxMainnetDepositStats", id, "totalGasUsed", "1");
    assert.fieldEquals("IntmaxMainnetDepositStats", id, "totalValue", "100");
    assert.fieldEquals("IntmaxMainnetDepositStats", id, "tokenIndex", "1");
    assert.fieldEquals("IntmaxMainnetDepositStats", id, "tokenAddress", TOKEN_ADDRESS.toHexString());
  });
});
