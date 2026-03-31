import type { FeeMetrics } from "../utils/types.js";

import { BLOCK_WINDOW_MONERO } from "../utils/constants.js";

import { MAX_TXS_PER_BATCH, MONERO_FAIL_NODES_API_URL, XMR_DECIMALS } from "./constants.js";

export interface MoneroTransaction {
  txHash: string;
  blockHeight: number;
  blockTimestamp: number;
  data: {
    version: number;
    unlock_time: number;
    vin: { key: { amount: number; key_offsets: number[]; k_image: string } }[];
    vout: { amount: number; target: { tagged_key?: { key: string; view_tag: string }; key?: string } }[];
    extra: number[];
    rct_signatures: { type: number; txnFee: number };
  };
}

/**
 * Retrieve available Monero nodes from the monero.fail API
 * @returns An array of Monero node URLs
 */
const getMoneroNodes = async (): Promise<string[]> => {
  const response = await fetch(MONERO_FAIL_NODES_API_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Monero nodes from ${MONERO_FAIL_NODES_API_URL} with status ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as { monero?: { clear?: string[] } };

  const nodes = data.monero?.clear ?? [];
  const uniqueNodes = Array.from(new Set(nodes));

  return uniqueNodes;
};

/**
 * Execute an operation using the first healthy Monero node from the list.
 * @param operation function to execute an operation with a given Monero node URL
 * @returns The result of the operation if successful with any of the nodes
 * @throws An error if all nodes fail to execute the operation
 */
const tryWithMoneroNodes = async <T>(operation: (node: string) => Promise<T>): Promise<T> => {
  const nodes = await getMoneroNodes();

  const runAtIndex = async (index: number, lastError?: unknown): Promise<T> => {
    if (index >= nodes.length) {
      throw new Error(`All Monero nodes failed. Last error: ${String(lastError)}`);
    }

    const node = nodes[index];

    if (!node) {
      throw new Error(`Monero node is undefined at index ${index}`);
    }

    try {
      return await operation(node);
    } catch (error) {
      return runAtIndex(index + 1, error);
    }
  };

  return runAtIndex(0);
};

/**
 * Get all transactions in a batch (array) of hashes
 * @param node Monero remote node
 * @param txHashes batch of transaction hashes to fetch
 * @returns array of Monero transactions with its data
 */
const getTransactionsInBatch = async (node: string, txHashes: string[]): Promise<MoneroTransaction[]> => {
  const response = await fetch(`${node}/get_transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ txs_hashes: txHashes, decode_as_json: true }),
  });

  if (!response.ok) {
    throw new Error(`Monero RPC get_transactions request failed with status ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    txs?: { tx_hash: string; block_height: number; block_timestamp: number; as_json: string }[];
  };

  return (data.txs ?? [])
    .filter((tx) => tx.as_json)
    .map((tx) => ({
      txHash: tx.tx_hash,
      blockHeight: tx.block_height,
      blockTimestamp: tx.block_timestamp,
      data: JSON.parse(tx.as_json) as MoneroTransaction["data"],
    }));
};

/**
 * Get block data from a given height (block number)
 * @param node Monero remote node URL
 * @param height block number
 * @returns block data including tx hashes
 */
const getBlock = async (node: string, height: number): Promise<{ tx_hashes?: string[] }> => {
  const response = await fetch(`${node}/json_rpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "0", method: "get_block", params: { height } }),
  });

  const data = (await response.json()) as { result: { tx_hashes?: string[] } };

  return data.result;
};

/**
 * Fetches all transactions for blocks from startBlock to endBlock (calculated with BLOCK_WINDOW_MONERO)
 *
 * Block tx hashes are retrieved via `get_block` (JSON-RPC) in parallel,
 * then transaction data is fetched in batches via `get_transactions` (HTTP).
 *
 * @param node Monero remote node URL
 * @param startBlock Starting block height (inclusive)
 *
 * @see https://docs.getmonero.org/rpc-library/monerod-rpc/#get_block
 * @see https://docs.getmonero.org/rpc-library/monerod-rpc/#get_transactions
 */
const getTransactionsInBlockWindow = async (node: string, startBlock: number): Promise<MoneroTransaction[]> => {
  const heights = Array.from({ length: BLOCK_WINDOW_MONERO }, (_, i) => startBlock + i);
  const blocks = await Promise.all(heights.map((height) => getBlock(node, height)));
  const txHashes = blocks.map((block) => block.tx_hashes ?? []).flat();

  if (txHashes.length === 0) {
    return [];
  }

  const totalBatches = Math.ceil(txHashes.length / MAX_TXS_PER_BATCH);
  const batches = Array.from({ length: totalBatches }, (_, i) =>
    txHashes.slice(i * MAX_TXS_PER_BATCH, (i + 1) * MAX_TXS_PER_BATCH),
  );

  const results = await Promise.all(batches.map((batch) => getTransactionsInBatch(node, batch)));
  return results.flat();
};

/**
 * Get the latest block height
 * @param node Monero remote node URL
 * @returns The latest block height
 */
export const getLatestBlockHeight = async (node: string): Promise<number> => {
  const response = await fetch(`${node}/json_rpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "0", method: "get_block_count" }),
  });

  const data = (await response.json()) as { result: { count: number } };

  // We cannot know if the current block has been published at the time of the benchmarking
  // so we will always consider the previous block (current -1)
  return data.result.count - 1;
};

/**
 * Get all monero transactions with 2 outputs (1 recipient + 1 change to sender)
 * @returns array of Monero transactions with 2 outputs
 *
 * Txs explorer:
 * https://monerohash.com/explorer/
 */
export const getOneInputTwoOutputsTransactions = async (): Promise<MoneroTransaction[]> =>
  tryWithMoneroNodes(async (node) => {
    const latestBlock = await getLatestBlockHeight(node);
    const startBlock = latestBlock - BLOCK_WINDOW_MONERO;

    const transactions = await getTransactionsInBlockWindow(node, startBlock);

    return transactions.filter((tx) => tx.data.vin.length === 1 && tx.data.vout.length === 2);
  });

/**
 * Calculate gas metrics for Monero transactions
 * @param transactions array of Monero transactions
 */
export const getMoneroMetrics = (transactions: MoneroTransaction[]): FeeMetrics => {
  const { length } = transactions;

  if (length === 0) {
    return {
      averageGasUsed: "no-data",
      averageGasPrice: "no-data",
      averageTxFee: "no-data",
    };
  }

  const averageTxFee =
    transactions.reduce((sum, tx) => {
      const fee = tx.data.rct_signatures.txnFee / 10 ** XMR_DECIMALS;

      return sum + fee;
    }, 0) / length;

  return { averageGasUsed: "no-data", averageGasPrice: "no-data", averageTxFee };
};
