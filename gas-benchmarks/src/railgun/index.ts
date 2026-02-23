import { mainnet } from "viem/chains";

import type { GasMetrics } from "../utils/types.js";

import { MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  RAILGUN_SMART_WALLET_PROXY,
  SHIELD_ERC20_EVENTS,
  TRANSFER_ERC20_EVENTS,
  UNSHIELD_ERC20_EVENTS,
} from "./constants.js";

export class Railgun {
  readonly name = "railgun";

  readonly version = "0.0.1";

  async benchmark(): Promise<Record<string, GasMetrics>> {
    const [shieldErc20, unshieldErc20, transferErc20] = await Promise.all([
      this.benchmarkShieldERC20(),
      this.benchmarkUnshieldERC20(),
      this.benchmarkTransferERC20(),
    ]);

    return { shieldErc20, unshieldErc20, transferErc20 };
  }

  async benchmarkShieldERC20(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      events: SHIELD_ERC20_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkUnshieldERC20(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      events: UNSHIELD_ERC20_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} unshield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkTransferERC20(): Promise<GasMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: RAILGUN_SMART_WALLET_PROXY,
      events: TRANSFER_ERC20_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} transfer ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }
}
