import { crypto as graphCrypto, ethereum, Bytes } from "@graphprotocol/graph-ts";

export function logsMatchEvents(logs: ethereum.Log[], events: string[]): boolean {
  if (logs.length !== events.length) {
    return false;
  }

  for (let i = 0; i < logs.length; i += 1) {
    const event = Bytes.fromUTF8(events[i]);
    const signature = graphCrypto.keccak256(event).toHex();
    const topic = logs[i].topics[0].toHex();

    // eslint-disable-next-line eqeqeq
    if (signature != topic) {
      return false;
    }
  }

  return true;
}
