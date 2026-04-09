import { mainnet } from "viem/chains";

import type { IAggregatedMetrics } from "./types.js";
import type { TransactionReceipt } from "viem";

import { BLOCK_WINDOW_ETHEREUM_5_WEEKS, MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  HINKAL_POOL,
  SHIELD_ERC20_EVENTS,
  SHIELD_ETH_EVENTS,
  INTERNAL_TRANSFER_EVENTS,
  UNSHIELD_ERC20_EVENTS,
  UNSHIELD_ETH_EVENTS,
  HINKAL_CONFIG,
} from "./constants.js";

export class Hinkal {
  readonly name = HINKAL_CONFIG.name;

  readonly version = HINKAL_CONFIG.version;

  async benchmark(): Promise<IAggregatedMetrics> {
    const [
      shieldEthReceipts,
      unshieldEthReceipts,
      internalTransferReceipts,
      shieldErc20Receipts,
      unshieldErc20Receipts,
    ] = await Promise.all([
      this.benchmarkShieldETH(),
      this.benchmarkUnshieldETH(),
      this.benchmarkInternalTransfer(),
      this.benchmarkShieldERC20(),
      this.benchmarkUnshieldERC20(),
    ]);

    return {
      shieldEth: getAverageMetrics(shieldEthReceipts),
      unshieldEth: getAverageMetrics(unshieldEthReceipts),
      internalTransfer: getAverageMetrics(internalTransferReceipts),
      shieldErc20: getAverageMetrics(shieldErc20Receipts),
      unshieldErc20: getAverageMetrics(unshieldErc20Receipts),
      anonymitySetSize: {
        eth: shieldEthReceipts.length - unshieldEthReceipts.length,
        ...this.benchmarkAnonymitySetSizeERC20(shieldErc20Receipts, unshieldErc20Receipts),
      },
    };
  }

  private async benchmarkShieldETH(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: SHIELD_ETH_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkUnshieldETH(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: UNSHIELD_ETH_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkInternalTransfer(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: INTERNAL_TRANSFER_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} internal transfer: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkShieldERC20(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: SHIELD_ERC20_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkUnshieldERC20(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: HINKAL_POOL,
      events: UNSHIELD_ERC20_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private benchmarkAnonymitySetSizeERC20(
    shieldReceipts: TransactionReceipt[],
    unshieldReceipts: TransactionReceipt[],
  ): Record<string, bigint | number> {
    const shieldMap = shieldReceipts.reduce((map, receipt) => {
      const address = receipt.to;

      if (address) {
        const count = map.get(address) ?? 0;
        map.set(address, count + 1);
      }

      return map;
    }, new Map<string, number>());

    const unshieldMap = unshieldReceipts.reduce((map, receipt) => {
      const address = receipt.to;

      if (address) {
        const count = map.get(address) ?? 0;
        map.set(address, count + 1);
      }

      return map;
    }, new Map<string, number>());

    return [...shieldMap.entries()].reduce<Record<string, bigint | number>>((acc, [address, count]) => {
      acc[address] = count - (unshieldMap.get(address) ?? 0);

      return acc;
    }, {});
  }
}
