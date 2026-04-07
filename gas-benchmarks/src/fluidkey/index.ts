import { mainnet } from "viem/chains";

import type { FeeMetrics } from "../utils/types.js";

import { BLOCK_WINDOW_ETHEREUM_5_WEEKS, BLOCK_WINDOW_ETHEREUM_10_MINUTES, MIN_SAMPLES } from "../utils/constants.js";
import { getValidEthTransfers, getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  FLUIDKEY_RELAYER_CONTRACT,
  SHIELD_ERC20_EVENTS,
  TRANSFER_ERC20_EVENTS,
  TRANSFER_ETH_EVENTS,
  USDC_ERC20_TOKEN_ADDRESS,
} from "./constants.js";

export class Fluidkey {
  readonly name = "fluidkey";

  readonly version = "1.3.0";

  async benchmark(): Promise<Record<string, FeeMetrics>> {
    const [shieldEth, shieldErc20, transferEth, transferErc20] = await Promise.all([
      this.benchmarkShieldETH(),
      this.benchmarkShieldERC20(),
      this.benchmarkTransferETH(),
      this.benchmarkTransferERC20(),
    ]);

    return { shieldEth, shieldErc20, transferEth, transferErc20 };
  }

  async benchmarkShieldETH(): Promise<FeeMetrics> {
    const receipts = await getValidEthTransfers({
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_10_MINUTES, // TODO: fetch native ETH txs using block window
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkShieldERC20(): Promise<FeeMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: USDC_ERC20_TOKEN_ADDRESS,
      events: SHIELD_ERC20_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_10_MINUTES, // there are a lot of ERC20 transfers so use a small block window to rate limit
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} shield ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkTransferETH(): Promise<FeeMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: FLUIDKEY_RELAYER_CONTRACT,
      events: TRANSFER_ETH_EVENTS,
      chain: mainnet,
      blockWindow: BLOCK_WINDOW_ETHEREUM_5_WEEKS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} transfer ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkTransferERC20(): Promise<FeeMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: FLUIDKEY_RELAYER_CONTRACT,
      events: TRANSFER_ERC20_EVENTS,
      chain: mainnet,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} transfer ERC20: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }
}
