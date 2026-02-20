import {
  createPublicClient,
  encodeEventTopics,
  http,
  type AbiEvent,
  type Hash,
  type Log,
  type PublicClient,
  type TransactionReceipt,
} from "viem";
import { mainnet, scroll } from "viem/chains";

import type { GetEventLogs } from "./types.js";

import { ETH_RPC_URL, MAX_NUMBER_OF_RPC_TRIES, NUMBER_OF_TRANSACTIONS, SCROLL_RPC_URL } from "./constants.js";
import { getBlockInRange, getFromAndToBlocks } from "./utils.js";

export const publicClient = createPublicClient({ chain: mainnet, transport: http(ETH_RPC_URL) });

export const scrollPublicClient = createPublicClient({ chain: scroll, transport: http(SCROLL_RPC_URL) });

export const getEventLogs = async ({
  contractAddress,
  events,
  maxLogs,
  fromBlock: initialFromBlock,
  client = publicClient,
}: GetEventLogs): Promise<Log[]> => {
  const latestBlock = await client.getBlockNumber();
  let { fromBlock, toBlock } = getFromAndToBlocks(latestBlock, initialFromBlock);

  let tries = 0;
  const logs: Log[] = [];

  while (logs.length < maxLogs) {
    // eslint-disable-next-line no-await-in-loop
    const batchLogs = await client.getLogs({
      address: contractAddress,
      events,
      fromBlock,
      toBlock,
    });

    logs.push(...batchLogs);

    if (fromBlock === 0n) {
      break;
    }

    toBlock = fromBlock - 1n;
    fromBlock = getBlockInRange(toBlock);

    if (tries >= MAX_NUMBER_OF_RPC_TRIES) {
      break;
    }

    tries += 1;
  }

  return logs;
};

export const getUniqueLogs = (logs: Log[]): Log[] => {
  const savedTxs = new Set<Hash>();

  const uniqueTxs = logs.filter((log) => {
    const { transactionHash } = log;

    if (!transactionHash) {
      return false;
    }

    if (savedTxs.has(transactionHash)) {
      return false;
    }

    savedTxs.add(transactionHash);
    return true;
  });

  return uniqueTxs;
};

export const getTransactionsWithEvents = async (
  logs: Log[],
  events: readonly AbiEvent[],
  client: PublicClient = publicClient,
): Promise<TransactionReceipt[]> => {
  const eventTopics = events.map((event) => encodeEventTopics({ abi: [event] })[0]);

  return logs.reduce<Promise<TransactionReceipt[]>>(async (accumulatorPromise, log) => {
    const accumulator = await accumulatorPromise;

    if (accumulator.length >= NUMBER_OF_TRANSACTIONS) {
      return accumulator;
    }

    const receipt = await client.getTransactionReceipt({ hash: log.transactionHash! });

    if (receipt.logs.length !== events.length) {
      return accumulator;
    }

    const hasAllEvents = eventTopics.every((eventTopic, index) => {
      const logTopic = receipt.logs[index]!.topics[0];

      return logTopic === eventTopic;
    });

    if (!hasAllEvents) {
      return accumulator;
    }

    accumulator.push(receipt);

    return accumulator;
  }, Promise.resolve([]));
};
