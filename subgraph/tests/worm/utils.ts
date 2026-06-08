import { Address, Bytes, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockCall } from "matchstick-as";

import { SwapBethWithEthCall } from "../../generated/BETHToETH/BETHToETH";

export function createSwapBethWithEthCall(txHash: Bytes, swapAmount: BigInt, recipient: Address): SwapBethWithEthCall {
  const mockCall = newMockCall();

  const call = changetype<SwapBethWithEthCall>(mockCall);

  call.transaction.hash = txHash;

  call.inputValues = [
    new ethereum.EventParam("_swapAmount", ethereum.Value.fromUnsignedBigInt(swapAmount)),
    new ethereum.EventParam("_recipient", ethereum.Value.fromAddress(recipient)),
  ];

  return call;
}
