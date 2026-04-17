import {
  createPublicClient,
  encodeEventTopics,
  http,
  toHex,
  type Chain,
  type Hash,
  type Log,
  type PublicClient,
  type TransactionReceipt,
} from "viem";
import { mainnet, scroll, sepolia } from "viem/chains";

import type {
  EthGetBlockReceiptsSchema,
  GetAllLogsInput,
  GetBlockWindowInput,
  GetBlockWindowOutput,
  GetValidEthTransfersInput,
  GetValidReceiptsInput,
  GetValidTransactionsInput,
} from "./interfaces.js";

import {
  ETH_RPC_URL,
  SCROLL_RPC_URL,
  BLOCK_RANGE,
  MAX_SAMPLES,
  BLOCK_WINDOW_ETHEREUM_1_WEEK,
  BLOCK_WINDOW_SCROLL_1_WEEK,
  SEPOLIA_RPC_URL,
  BATCH_SIZE_FOR_RPC_CALLS,
} from "./constants.js";
import { withRetries } from "./http.js";
import { isNativeTransfer, sleep } from "./utils.js";

/** Pre-configured RPC clients keyed by chain ID */
const clients: Record<number, PublicClient | undefined> = {
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: http(ETH_RPC_URL, { batch: true }) }),
  [sepolia.id]: createPublicClient({ chain: sepolia, transport: http(SEPOLIA_RPC_URL, { batch: true }) }),
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

/**
 * Returns the block window (start block/latest to end block/oldest) for a given chain
 * @param client - The RPC client to use for fetching the blocks
 * @param chainId - The chain ID to determine the default block window
 * @param latestBlock - Optional latest block number to start scanning from (defaults to current block)
 * @param blockWindow - Optional block window size to scan (overrides default if provided)
 * @returns An object containing the scanStart and scanEnd block numbers
 * { scanStart: bigint; scanEnd: bigint }
 */
const getBlockWindow = async ({
  client,
  chainId,
  latestBlock,
  blockWindow,
}: GetBlockWindowInput): Promise<GetBlockWindowOutput> => {
  let scanWindow: bigint;

  if (blockWindow !== undefined) {
    scanWindow = blockWindow;
  } else if (chainId === mainnet.id) {
    scanWindow = BLOCK_WINDOW_ETHEREUM_1_WEEK;
  } else if (chainId === scroll.id) {
    scanWindow = BLOCK_WINDOW_SCROLL_1_WEEK;
  } else if (chainId === sepolia.id) {
    scanWindow = BLOCK_WINDOW_ETHEREUM_1_WEEK;
  } else {
    throw new Error(`No block window configured for chain ID: ${chainId}`);
  }

  const scanStart = latestBlock ?? (await client.getBlockNumber());

  let scanEnd = scanStart - scanWindow;
  if (scanEnd < 0n) {
    scanEnd = 0n;
  }

  return { scanStart, scanEnd };
};

/** Scans blocks in chunks from scanStart down to scanEnd, deduplicating by tx hash */
const getAllLogs = async ({ client, contractAddress, events, scanEnd, scanStart }: GetAllLogsInput): Promise<Log[]> => {
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
      strict: true,
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
const getValidReceipts = async ({ client, logs, events }: GetValidReceiptsInput): Promise<TransactionReceipt[]> => {
  const eventTopics = events.map((event) => encodeEventTopics({ abi: [event] })[0]);

  const receipts: TransactionReceipt[] = [];

  for (let i = 0; i < logs.length; i += BATCH_SIZE_FOR_RPC_CALLS) {
    const batch = logs.slice(i, i + BATCH_SIZE_FOR_RPC_CALLS);

    // eslint-disable-next-line no-await-in-loop
    const tempReceipts = await Promise.all(
      batch.map((log) => withRetries(() => client.getTransactionReceipt({ hash: log.transactionHash! }))),
    );

    receipts.push(...tempReceipts);

    // eslint-disable-next-line no-await-in-loop
    await sleep(100); // delay between batches to avoid overwhelming the RPC
  }

  return receipts.filter((receipt) => {
    const hasExpectedLogCount = receipt.logs.length === events.length;
    const hasMatchingTopics = eventTopics.every((eventTopic, index) => receipt.logs[index]?.topics[0] === eventTopic);
    return hasExpectedLogCount && hasMatchingTopics;
  });
};

/** Scans a 7-day block window, fetches receipts, and returns valid transactions */
export const getValidTransactions = async ({
  contractAddress,
  events,
  chain,
  latestBlock,
  blockWindow,
}: GetValidTransactionsInput): Promise<TransactionReceipt[]> => {
  const client = getClient(chain);

  const { scanStart, scanEnd } = await getBlockWindow({ client, chainId: chain.id, latestBlock, blockWindow });

  const logs = await getAllLogs({ client, contractAddress, events, scanEnd, scanStart });
  return getValidReceipts({ client, logs, events });
};

/**
 * Fetches receipts and filters to those matching the expected event pattern for native ETH transfers
 * @param chain - The chain to scan for native ETH transfers
 * @param latestBlock - Optional latest block number to start scanning from (defaults to current block)
 * @param blockWindow - Optional block window size to scan (overrides default if provided)
 * @returns An array of transaction receipts for valid native ETH transfers
 */
export const getValidEthTransfers = async ({
  chain,
  latestBlock,
  blockWindow,
}: GetValidEthTransfersInput): Promise<TransactionReceipt[]> => {
  const client = getClient(chain);

  const { scanStart, scanEnd } = await getBlockWindow({ client, chainId: chain.id, latestBlock, blockWindow });

  const receipts: TransactionReceipt[] = [];

  let block = scanStart;

  while (block >= scanEnd) {
    // eslint-disable-next-line no-await-in-loop
    const receiptsFromRPC = await client.request<EthGetBlockReceiptsSchema>({
      method: "eth_getBlockReceipts",
      params: [toHex(block)],
    });

    const gasUsedAsQuantity = receiptsFromRPC.map((receipt) => ({
      ...receipt,
      // RPC returns gasUsed and effectiveGasPrice as hex string
      gasUsed: BigInt(receipt.gasUsed as unknown as string),
      effectiveGasPrice: BigInt(receipt.effectiveGasPrice as unknown as string),
    }));

    const nativeTransfers = gasUsedAsQuantity.filter((receipt) => isNativeTransfer(receipt));

    receipts.push(...nativeTransfers);

    block -= 1n;
  }

  return receipts;
};
