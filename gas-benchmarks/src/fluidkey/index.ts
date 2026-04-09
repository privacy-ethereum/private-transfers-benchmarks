import { mainnet } from "viem/chains";

import type { IAggregatedMetrics } from "./types.js";
import type { TransactionReceipt } from "viem";

import { BLOCK_WINDOW_ETHEREUM_5_WEEKS, BLOCK_WINDOW_ETHEREUM_10_MINUTES, MIN_SAMPLES } from "../utils/constants.js";
import { getValidEthTransfers, getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  FLUIDKEY_CONFIG,
  FLUIDKEY_RELAYER_CONTRACT,
  SHIELD_ERC20_EVENTS,
  TRANSFER_ERC20_EVENTS,
  TRANSFER_ETH_EVENTS,
  USDC_ERC20_TOKEN_ADDRESS,
} from "./constants.js";

export class Fluidkey {
  readonly name = FLUIDKEY_CONFIG.name;

  readonly version = FLUIDKEY_CONFIG.version;

  async benchmark(): Promise<IAggregatedMetrics> {
    const [shieldEthReceipts, shieldErc20Receipts, transferEthReceipts, transferErc20Receipts] = await Promise.all([
      this.benchmarkShieldETH(),
      this.benchmarkShieldERC20(),
      this.benchmarkTransferETH(),
      this.benchmarkTransferERC20(),
    ]);

    return {
      shieldEth: getAverageMetrics(shieldEthReceipts),
      shieldErc20: getAverageMetrics(shieldErc20Receipts),
      transferEth: getAverageMetrics(transferEthReceipts),
      transferErc20: getAverageMetrics(transferErc20Receipts),
      anonymitySetSize: {
        eth: shieldEthReceipts.length - transferEthReceipts.length,
        ...this.benchmarkAnonymitySetSizeERC20(shieldErc20Receipts, transferErc20Receipts),
      },
    };
  }

  private async benchmarkShieldETH(): Promise<TransactionReceipt[]> {
    const receipts = await getValidEthTransfers({
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_10_MINUTES, // TODO: fetch native ETH txs using block window
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkShieldERC20(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: USDC_ERC20_TOKEN_ADDRESS,
      events: SHIELD_ERC20_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_10_MINUTES, // there are a lot of ERC20 transfers so use a small block window to rate limit
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkTransferETH(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: FLUIDKEY_RELAYER_CONTRACT,
      events: TRANSFER_ETH_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} transfer ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkTransferERC20(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: FLUIDKEY_RELAYER_CONTRACT,
      events: TRANSFER_ERC20_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} transfer ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private benchmarkAnonymitySetSizeERC20(
    shieldReceipts: TransactionReceipt[],
    transferReceipts: TransactionReceipt[],
  ): Record<string, bigint | number> {
    const shieldMap = shieldReceipts.reduce((map, receipt) => {
      const address = receipt.to;

      if (address) {
        const count = map.get(address) ?? 0;
        map.set(address, count + 1);
      }

      return map;
    }, new Map<string, number>());

    const unshieldMap = transferReceipts.reduce((map, receipt) => {
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
