import { createPublicClient, http, type Hash, type Log, type TransactionReceipt } from "viem";
import { mainnet } from "viem/chains";

import type { GetEventLogs } from "./types.js";

import { ETH_RPC_URL, MAX_NUMBER_OF_RPC_TRIES, NUMBER_OF_TRANSACTIONS } from "./constants.js";
import { getBlockInRange } from "./utils.js";

export const publicClient = createPublicClient({
  transport: http(ETH_RPC_URL),
  chain: mainnet,
});

export const getEventLogs = async ({ contractAddress, event, maxLogs }: GetEventLogs): Promise<Log[]> => {
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

export const getTransactionsWithNEvents = async (
  logs: Log[],
  numberOfEvents: number,
): Promise<TransactionReceipt[]> => {
  const txs = await logs.reduce<Promise<TransactionReceipt[]>>(async (accumulatorPromise, log) => {
    const accumulator = await accumulatorPromise;

    if (accumulator.length >= NUMBER_OF_TRANSACTIONS) {
      return accumulator;
    }

    const receipt = await publicClient.getTransactionReceipt({ hash: log.transactionHash! });
    if (receipt.logs.length === numberOfEvents) {
      accumulator.push(receipt);
    }

    return accumulator;
  }, Promise.resolve([]));

  return txs;
};
