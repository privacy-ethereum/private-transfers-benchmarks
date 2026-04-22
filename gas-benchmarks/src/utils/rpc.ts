import {
  createPublicClient,
  encodeEventTopics,
  http,
  toHex,
  type Block,
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
  GetBaseFeePerGasAverageInDaysWindowInput,
  GetBlockWindowInput,
  GetBlockWindowOutput,
  GetValidEthTransfersInput,
  GetValidReceiptsInput,
  GetValidTransactionsInput,
} from "./interfaces.js";

import {
  ETH_RPC_URL,
  SEPOLIA_RPC_URL,
  SCROLL_RPC_URL,
  BLOCK_RANGE,
  MAX_SAMPLES,
  BLOCK_WINDOW_ETHEREUM_1_WEEK,
  BLOCK_WINDOW_SCROLL_1_WEEK,
  BATCH_SIZE_FOR_RPC_CALLS,
  DELAY_BETWEEN_BATCHES,
} from "./constants.js";
import { isNativeTransfer, sleep } from "./utils.js";

/** Pre-configured RPC clients keyed by chain ID */
const clients: Record<number, PublicClient | undefined> = {
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: http(ETH_RPC_URL, { batch: true }) }),
  [scroll.id]: createPublicClient({ chain: scroll, transport: http(SCROLL_RPC_URL, { batch: true }) }),
  [sepolia.id]: createPublicClient({ chain: sepolia, transport: http(SEPOLIA_RPC_URL, { batch: true }) }),
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
  } else if (chainId === sepolia.id) {
    scanWindow = BLOCK_WINDOW_ETHEREUM_1_WEEK;
  } else if (chainId === scroll.id) {
    scanWindow = BLOCK_WINDOW_SCROLL_1_WEEK;
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

  const receipts = await Promise.all(logs.map((log) => client.getTransactionReceipt({ hash: log.transactionHash! })));

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

/** Returns the number of blocks produced in an hour for a given chain */
const getBlocksPerHour = (chainId: number): number => {
  switch (chainId) {
    case mainnet.id:
    case sepolia.id:
      return 300; // 3600s / 12s
    case scroll.id:
      return 3600; // 3600s / 1s
    default:
      throw new Error(`No block time configured for chain ID: ${chainId}`);
  }
};

/** Returns the average base fee per gas price within a days window */
export const getBaseFeePerGasAverageInDaysWindow = async ({
  chain,
  windowDays,
  latestBlock,
}: GetBaseFeePerGasAverageInDaysWindowInput): Promise<bigint> => {
  const client = getClient(chain);
  const step = getBlocksPerHour(chain.id);
  const samples = windowDays * 24; // 24 hours per day

  const endBlock = latestBlock ?? (await client.getBlockNumber());

  const blockNumbers = Array.from({ length: samples }, (_, index) => endBlock - BigInt(index * step));

  const blocks: Block[] = [];

  for (let i = 0; i < blockNumbers.length; i += BATCH_SIZE_FOR_RPC_CALLS) {
    const batch = blockNumbers.slice(i, i + BATCH_SIZE_FOR_RPC_CALLS);

    // eslint-disable-next-line no-await-in-loop
    const batchBlocks = await Promise.all(batch.map((blockNumber) => client.getBlock({ blockNumber })));

    blocks.push(...batchBlocks);

    // eslint-disable-next-line no-await-in-loop
    await sleep(DELAY_BETWEEN_BATCHES);
  }

  const baseFees = blocks
    .map((block) => block.baseFeePerGas)
    .filter((baseFeePerGas): baseFeePerGas is bigint => baseFeePerGas !== null);

  if (baseFees.length === 0) {
    throw new Error(`No base fee values found for chain ID: ${chain.id}`);
  }

  return baseFees.reduce((sum, baseFeePerGas) => sum + baseFeePerGas, 0n) / BigInt(baseFees.length);
};
