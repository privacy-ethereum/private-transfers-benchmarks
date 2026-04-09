import { parseEventLogs, type TransactionReceipt } from "viem";
import { mainnet } from "viem/chains";

import type { IAggregatedMetrics } from "./types.js";

import { MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  RAILGUN_CONFIG,
  RAILGUN_SMART_WALLET_PROXY,
  SHIELD_ERC20_EVENTS,
  TRANSFER_ERC20_EVENTS,
  UNSHIELD_ERC20_EVENTS,
} from "./constants.js";

export class Railgun {
  readonly name = RAILGUN_CONFIG.name;

  readonly version = RAILGUN_CONFIG.version;

  async benchmark(): Promise<IAggregatedMetrics> {
    const [shieldErc20Receipts, unshieldErc20Receipts, transferErc20Receipts] = await Promise.all([
      this.benchmarkShieldERC20(),
      this.benchmarkUnshieldERC20(),
      this.benchmarkTransferERC20(),
    ]);

    return {
      shieldErc20: getAverageMetrics(shieldErc20Receipts),
      unshieldErc20: getAverageMetrics(unshieldErc20Receipts),
      transferErc20: getAverageMetrics(transferErc20Receipts),
      anonymitySetSize: this.benchmarkAnonymitySetSizeERC20(shieldErc20Receipts, unshieldErc20Receipts),
    };
  }

  private async benchmarkShieldERC20(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      events: SHIELD_ERC20_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkUnshieldERC20(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      events: UNSHIELD_ERC20_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return receipts;
  }

  private async benchmarkTransferERC20(): Promise<TransactionReceipt[]> {
    const receipts = await getValidTransactions({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
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
    unshieldReceipts: TransactionReceipt[],
  ): Record<string, bigint | number> {
    const shieldEvents = parseEventLogs({
      abi: [SHIELD_ERC20_EVENTS[2]],
      logs: shieldReceipts.flatMap((receipt) => receipt.logs),
    });

    const unshieldEvents = parseEventLogs({
      abi: [UNSHIELD_ERC20_EVENTS[3]],
      logs: unshieldReceipts.flatMap((receipt) => receipt.logs),
    });

    const shieldMap = shieldEvents.reduce((map, event) => {
      const tokenAddresses = event.args.commitments.map((commitment) => commitment.token.tokenAddress);

      tokenAddresses.forEach((tokenAddress) => {
        const count = map.get(tokenAddress) ?? 0;
        map.set(tokenAddress, count + 1);
      });

      return map;
    }, new Map<string, number>());

    const unshieldMap = unshieldEvents.reduce((map, event) => {
      const { tokenAddress } = event.args.token;
      const count = map.get(tokenAddress) ?? 0;
      map.set(tokenAddress, count + 1);

      return map;
    }, new Map<string, number>());

    return [...shieldMap.entries()].reduce<Record<string, bigint | number>>((acc, [address, count]) => {
      acc[address] = count - (unshieldMap.get(address) ?? 0);

      return acc;
    }, {});
  }
}
