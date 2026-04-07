import type { AbiEvent, Address, Chain, Hex, Log, PublicClient, TransactionReceipt } from "viem";

/**
 * Return schema for the `eth_getBlockReceipts` RPC method.
 * Not defined in viem by default
 */
export interface EthGetBlockReceiptsSchema {
  Method: "eth_getBlockReceipts";
  Parameters: [Hex];
  ReturnType: TransactionReceipt[];
}

/**
 * Input for getBlockWindow function
 */
export interface GetBlockWindowInput {
  client: PublicClient;
  chainId: number;
  latestBlock: bigint | undefined;
  blockWindow: bigint | undefined;
}

/**
 * Output for getBlockWindow function
 */
export interface GetBlockWindowOutput {
  scanStart: bigint;
  scanEnd: bigint;
}

/**
 * Input for getAllLogs function
 */
export interface GetAllLogsInput {
  client: PublicClient;
  contractAddress: Address;
  events: readonly AbiEvent[];
  scanStart: bigint;
  scanEnd: bigint;
}

/**
 * Input for getValidReceipts function
 */
export interface GetValidReceiptsInput {
  client: PublicClient;
  logs: Log[];
  events: readonly AbiEvent[];
}

/**
 * Input for getValidTransactions function
 */
export interface GetValidTransactionsInput {
  contractAddress: Address;
  events: readonly AbiEvent[];
  chain: Chain;
  latestBlock?: bigint;
  blockWindow?: bigint;
}

/**
 * Input for getValidEthTransfers function
 */
export interface GetValidEthTransfersInput {
  chain: Chain;
  latestBlock?: bigint;
  blockWindow?: bigint;
}
