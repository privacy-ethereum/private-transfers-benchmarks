import {
  createPublicClient,
  encodeEventTopics,
  http,
  type AbiEvent,
  type Address,
  type Chain,
  type Hash,
  type Log,
  type PublicClient,
  type TransactionReceipt,
} from "viem";
import { mainnet, scroll } from "viem/chains";

import {
  ETH_RPC_URL,
  SCROLL_RPC_URL,
  BLOCK_RANGE,
  MAX_SAMPLES,
  BLOCK_WINDOW_ETHEREUM,
  BLOCK_WINDOW_SCROLL,
} from "./constants.js";

/** Pre-configured RPC clients keyed by chain ID */
const clients: Record<number, PublicClient> = {
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: http(ETH_RPC_URL, { batch: true }) }),
  [scroll.id]: createPublicClient({ chain: scroll, transport: http(SCROLL_RPC_URL, { batch: true }) }),
};

/** Returns the RPC client for a given chain */
const getClient = (chain: Chain): PublicClient => {
  const client = clients[chain.id];
  if (!client) {
    throw new Error(`No client configured for chain: ${chain.name}`);
  }
  return client;
};

/** Returns the 1-week block window size for a given chain */
const getBlockWindow = (chainId: number): bigint => {
  if (chainId === mainnet.id) {
    return BLOCK_WINDOW_ETHEREUM;
  }
  if (chainId === scroll.id) {
    return BLOCK_WINDOW_SCROLL;
  }
  throw new Error(`No block window configured for chain ID: ${chainId}`);
};

/** Scans blocks in chunks from scanStart down to scanEnd, deduplicating by tx hash */
const getAllLogs = async (
  client: PublicClient,
  contractAddress: Address,
  events: readonly AbiEvent[],
  scanEnd: bigint,
  scanStart: bigint,
): Promise<Log[]> => {
  let toBlock = scanStart;
  const uniqueLogs: Log[] = [];
  const seen = new Set<Hash>();

  while (toBlock >= scanEnd) {
    let fromBlock = toBlock - BLOCK_RANGE + 1n;

    if (fromBlock < scanEnd) {
      fromBlock = scanEnd;
    }

    // eslint-disable-next-line no-await-in-loop
    const batchLogs = await client.getLogs({
      address: contractAddress,
      events,
      fromBlock,
      toBlock,
    });

    batchLogs.forEach((log) => {
      if (!seen.has(log.transactionHash)) {
        seen.add(log.transactionHash);
        uniqueLogs.push(log);
      }
    });

    if (fromBlock <= scanEnd || seen.size >= MAX_SAMPLES) {
      break;
    }

    toBlock = fromBlock - 1n;
  }

  return uniqueLogs;
};

/** Fetches receipts and filters to those matching the expected event pattern */
const getValidReceipts = async (
  client: PublicClient,
  logs: Log[],
  events: readonly AbiEvent[],
): Promise<TransactionReceipt[]> => {
  const eventTopics = events.map((event) => encodeEventTopics({ abi: [event] })[0]);

  const receipts = await Promise.all(logs.map((log) => client.getTransactionReceipt({ hash: log.transactionHash! })));

  return receipts.filter((receipt) => {
    const hasExpectedLogCount = receipt.logs.length === events.length;
    const hasMatchingTopics = eventTopics.every((eventTopic, index) => receipt.logs[index]!.topics[0] === eventTopic);
    return hasExpectedLogCount && hasMatchingTopics;
  });
};

/** Scans a 7-day block window, fetches receipts, and returns valid transactions */
export const getValidTransactions = async ({
  contractAddress,
  events,
  chain,
  latestBlock,
}: {
  contractAddress: Address;
  events: readonly AbiEvent[];
  chain: Chain;
  latestBlock?: bigint;
}): Promise<TransactionReceipt[]> => {
  const client = getClient(chain);
  const blockWindow = getBlockWindow(chain.id);
  const scanStart = latestBlock ?? (await client.getBlockNumber());

  let scanEnd = scanStart - blockWindow;
  if (scanEnd < 0n) {
    scanEnd = 0n;
  }

  const uniqueLogs = await getAllLogs(client, contractAddress, events, scanEnd, scanStart);
  return getValidReceipts(client, uniqueLogs, events);
};
