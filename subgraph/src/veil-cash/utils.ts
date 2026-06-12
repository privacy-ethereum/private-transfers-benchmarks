import { ethereum, ByteArray, crypto as graphCrypto } from "@graphprotocol/graph-ts";

const WITHDRAW_TOPIC = graphCrypto.keccak256(ByteArray.fromUTF8("Withdrawal(address,uint256)"));
const NUMBER_OF_TOPICS_IN_WITHDRAW_EVENT = 2; // topics: signature, src. data: wad (not indexed)

export function getWithdrawalEvent(logs: ethereum.Log[]): ethereum.Log | null {
  for (let i = 0; i < logs.length; i += 1) {
    const log = logs[i];

    if (log.topics.length === NUMBER_OF_TOPICS_IN_WITHDRAW_EVENT) {
      if (log.topics[0].equals(WITHDRAW_TOPIC)) {
        return log;
      }

      return null;
    }
  }

  return null;
}
