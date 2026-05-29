import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Deposited } from "../../generated/LiquidityV2/LiquidityV2";
import { DirectWithdrawalQueued } from "../../generated/Withdrawal/Withdrawal";

export function createDepositEvent(
  depositId: BigInt,
  sender: Address,
  tokenIndex: i32,
  amount: BigInt,
  isEligible: boolean,
): Deposited {
  const event = changetype<Deposited>(newMockEvent());

  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("depositId", ethereum.Value.fromUnsignedBigInt(depositId)));

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

  event.parameters.push(
    new ethereum.EventParam(
      "recipientSaltHash",
      ethereum.Value.fromFixedBytes(
        Bytes.fromHexString("0x1111111111111111111111111111111111111111111111111111111111111111"),
      ),
    ),
  );

  event.parameters.push(
    new ethereum.EventParam("tokenIndex", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenIndex))),
  );

  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  event.parameters.push(new ethereum.EventParam("isEligible", ethereum.Value.fromBoolean(isEligible)));

  event.parameters.push(
    new ethereum.EventParam("depositedAt", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123456))),
  );

  return event;
}

export function createWithdrawalEvent(
  withdrawalHash: Bytes,
  recipient: Address,
  tokenIndex: i32,
  amount: BigInt,
): DirectWithdrawalQueued {
  const event = changetype<DirectWithdrawalQueued>(newMockEvent());

  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("withdrawalHash", ethereum.Value.fromFixedBytes(withdrawalHash)));
  event.parameters.push(new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient)));
  event.parameters.push(
    new ethereum.EventParam(
      "withdrawal",
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          ethereum.Value.fromAddress(recipient),
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenIndex)),
          ethereum.Value.fromUnsignedBigInt(amount),
          ethereum.Value.fromFixedBytes(
            Bytes.fromHexString("0x1111111111111111111111111111111111111111111111111111111111111111"),
          ),
        ]),
      ),
    ),
  );

  return event;
}
