import { ethereum, ByteArray, crypto as graphCrypto, Address, Bytes } from "@graphprotocol/graph-ts";

export const WITHDRAW_TOPIC = graphCrypto.keccak256(ByteArray.fromUTF8("Withdrawal(address,uint256)"));
const NUMBER_OF_TOPICS_IN_WITHDRAW_EVENT = 2; // topics: signature, src. data: wad (not indexed)

export const WETH_MAINNET_CONTRACT = Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
export const BETH_TO_ETH_CONTRACT = Address.fromString("0xbA5A285806c343AaD955a40FE4b6e5e607B752b6");

export function getWithdrawalEvent(logs: ethereum.Log[]): ethereum.Log | null {
  for (let i = 0; i < logs.length; i += 1) {
    const log = logs[i];
    const emitter = log.address;

    const isCorrectTopicLength = log.topics.length === NUMBER_OF_TOPICS_IN_WITHDRAW_EVENT;
    const isWithdrawTopic = log.topics[0].equals(WITHDRAW_TOPIC);
    const isWETHMainnetEmitter = emitter.equals(WETH_MAINNET_CONTRACT);

    if (isCorrectTopicLength && isWithdrawTopic && isWETHMainnetEmitter) {
      const source = Address.fromBytes(Bytes.fromUint8Array(log.topics[1].slice(12)));

      if (source.equals(BETH_TO_ETH_CONTRACT)) {
        return log;
      }
    }
  }

  return null;
}
