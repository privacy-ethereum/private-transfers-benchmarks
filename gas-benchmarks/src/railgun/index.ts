import type { Hash, Log, TransactionReceipt } from "viem";

import { NUMBER_OF_TRANSACTIONS } from "../utils/constants.js";
import { publicClient } from "../utils/rpc.js";
import { getBlockInRange } from "../utils/utils.js";

import { MAX_OF_LOGS, NUMBER_OF_EVENTS, RAILGUN_SMART_WALLET_PROXY, SHIELD_EVENT_ABI } from "./constants.js";

export class Railgun {
  async benchmarkShield(): Promise<void> {
    const txs = await this.getLatestShieldTransactions();

    const averageGasUsed = txs.reduce((acc, tx) => acc + tx.gasUsed, 0n) / BigInt(txs.length);
    const averageGasPrice = txs.reduce((acc, tx) => acc + tx.effectiveGasPrice, 0n) / BigInt(txs.length);
    const averageTxFee = averageGasUsed * averageGasPrice;

    // eslint-disable-next-line no-console
    console.log(averageGasUsed, averageGasPrice, averageTxFee);
  }

  async getLatestShieldTransactions(): Promise<TransactionReceipt[]> {
    const logs = await this.getShieldEventLogs();
    const uniqueLogs = this.getUniqueLogs(logs);

    return this.getShieldOnlyTransactions(uniqueLogs);
  }

  async getShieldEventLogs(): Promise<Log[]> {
    const latestBlock = await publicClient.getBlockNumber();
    let toBlock = latestBlock;
    let fromBlock = getBlockInRange(toBlock);

    const logs: Log[] = [];

    while (logs.length < MAX_OF_LOGS) {
      // eslint-disable-next-line no-await-in-loop
      const batchLogs = await publicClient.getLogs({
        address: RAILGUN_SMART_WALLET_PROXY,
        event: SHIELD_EVENT_ABI,
        fromBlock,
        toBlock,
      });

      logs.push(...batchLogs);

      if (fromBlock === 0n) {
        break;
      }

      toBlock = fromBlock - 1n;
      fromBlock = getBlockInRange(toBlock);
    }

    return logs;
  }

  getUniqueLogs(logs: Log[]): Log[] {
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
  }

  async getShieldOnlyTransactions(logs: Log[]): Promise<TransactionReceipt[]> {
    const shieldOnlyTxs = await Promise.all(
      logs.map(async (log) => {
        const receipt = await publicClient.getTransactionReceipt({ hash: log.transactionHash! });

        if (receipt.logs.length > NUMBER_OF_EVENTS) {
          return null;
        }

        return receipt;
      }),
    );

    return shieldOnlyTxs.filter((tx) => !!tx).slice(0, NUMBER_OF_TRANSACTIONS);
  }
}
