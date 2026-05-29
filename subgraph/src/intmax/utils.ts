import { Bytes, ethereum } from "@graphprotocol/graph-ts";

export const DIRECT_WITHDRAWAL_QUEUED_TOPIC = Bytes.fromHexString(
  "0xdbe674c66915823ad8cb90cac7eb482e951adec0311c9cf091da19de527ee935",
);

export function calculateDirectWithdrawalQueuedEvents(logs: ethereum.Log[]): number {
  let count = 0;

  for (let index = 0; index < logs.length; index += 1) {
    const log = logs[index];

    if (log.topics.length > 0) {
      if (log.topics[0].equals(DIRECT_WITHDRAWAL_QUEUED_TOPIC)) {
        count += 1;
      }
    }
  }

  return count;
}
