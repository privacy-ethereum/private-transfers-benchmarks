import { createPublicClient, http, type Hash, type Log, type TransactionReceipt } from "viem";
import { mainnet } from "viem/chains";

import type { GetShieldEventLogs, TopicFilterConfig } from "./types.js";

import { ETH_RPC_URL, MAX_NUMBER_OF_RPC_TRIES, NUMBER_OF_TRANSACTIONS } from "./constants.js";
import { getBlockInRange, receiptHasAnyTopic, receiptHasTopics } from "./utils.js";

export const publicClient = createPublicClient({
  transport: http(ETH_RPC_URL),
  chain: mainnet,
});

export const getEventLogs = async ({ contractAddress, event, maxLogs }: GetShieldEventLogs): Promise<Log[]> => {
  const latestBlock = await publicClient.getBlockNumber();
  let toBlock = latestBlock;
  let fromBlock = getBlockInRange(toBlock);

  let tries = 0;
  const logs: Log[] = [];

  while (logs.length < maxLogs) {
    // eslint-disable-next-line no-await-in-loop
    const batchLogs = await publicClient.getLogs({
      address: contractAddress,
      event,
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

export const getMatchingTransactions = async (
  logs: Log[],
  topicFilter: TopicFilterConfig,
): Promise<TransactionReceipt[]> => {
  const txs: TransactionReceipt[] = [];

  for (const log of logs) {
    if (txs.length >= NUMBER_OF_TRANSACTIONS) {
      break;
    }

    if (!log.transactionHash) {
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const receipt = await publicClient.getTransactionReceipt({ hash: log.transactionHash });
    if (
      receiptHasTopics(receipt, topicFilter.required) &&
      !receiptHasAnyTopic(receipt, topicFilter.forbidden)
    ) {
      txs.push(receipt);
    }
  }

  return txs;
};
