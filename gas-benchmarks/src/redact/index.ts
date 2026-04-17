import { sepolia } from "viem/chains";

import type { FeeMetrics } from "../utils/types.js";

import { BLOCK_WINDOW_ETHEREUM_3_DAYS, MIN_SAMPLES } from "../utils/constants.js";
import { getValidTransactions } from "../utils/rpc.js";
import { getAverageMetrics } from "../utils/utils.js";

import {
  CLAIM_DECRYPTED_ETH_EVENTS,
  CONFIDENTIAL_ETHER_PROXY,
  DECRYPT_ETH_EVENTS,
  ENCRYPT_ETH_EVENTS,
  ENCRYPTED_TOKEN_TRANSFER_EVENTS,
  REDACT_CONFIG,
} from "./constants.js";

export class Redact {
  readonly name = REDACT_CONFIG.name;

  readonly version = REDACT_CONFIG.version;

  async benchmark(): Promise<Record<string, FeeMetrics>> {
    const [encryptEth, decryptEth] = await Promise.all([this.benchmarkEncryptETH(), this.benchmarkDecryptETH()]);

    return { encryptEth, decryptEth };
  }

  async benchmarkEncryptETH(): Promise<FeeMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: CONFIDENTIAL_ETHER_PROXY,
      events: ENCRYPT_ETH_EVENTS,
      chain: sepolia,
      blockWindow: BLOCK_WINDOW_ETHEREUM_3_DAYS, // there are a lot of encrypted transfers so use a small block window to rate limit
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} encrypt ETH: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    return getAverageMetrics(receipts);
  }

  async benchmarkDecryptETH(): Promise<FeeMetrics> {
    const [decryptReceipts, claimReceipts] = await Promise.all([
      getValidTransactions({
        contractAddress: CONFIDENTIAL_ETHER_PROXY,
        events: DECRYPT_ETH_EVENTS,
        chain: sepolia,
        blockWindow: BLOCK_WINDOW_ETHEREUM_3_DAYS, // there are a lot of encrypted transfers so use a small block window to rate limit
      }),
      getValidTransactions({
        contractAddress: CONFIDENTIAL_ETHER_PROXY,
        events: CLAIM_DECRYPTED_ETH_EVENTS,
        chain: sepolia,
        blockWindow: BLOCK_WINDOW_ETHEREUM_3_DAYS, // there are a lot of encrypted transfers so use a small block window to rate limit
      }),
    ]);

    if (decryptReceipts.length < MIN_SAMPLES) {
      throw new Error(`${this.name} decrypt ETH: receipts (${decryptReceipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`);
    }

    if (claimReceipts.length < MIN_SAMPLES) {
      throw new Error(
        `${this.name} claim decrypted ETH: receipts (${claimReceipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`,
      );
    }

    const decryptMetrics = getAverageMetrics(decryptReceipts);
    const claimMetrics = getAverageMetrics(claimReceipts);

    // Sum decrypt and claim metrics to get the final metrics for the end-user to fully exit (decrypt + claim)
    const metrics: FeeMetrics = {
      averageGasUsed:
        decryptMetrics.averageGasUsed === "no-data" || claimMetrics.averageGasUsed === "no-data"
          ? "no-data"
          : Number(decryptMetrics.averageGasUsed) + Number(claimMetrics.averageGasUsed),
      averageGasPrice:
        decryptMetrics.averageGasPrice === "no-data" || claimMetrics.averageGasPrice === "no-data"
          ? "no-data"
          : Number(decryptMetrics.averageGasPrice) + Number(claimMetrics.averageGasPrice),
      averageTxFee:
        decryptMetrics.averageTxFee === "no-data" || claimMetrics.averageTxFee === "no-data"
          ? "no-data"
          : Number(decryptMetrics.averageTxFee) + Number(claimMetrics.averageTxFee),
    };

    return metrics;
  }

  // TODO: not enough txs at the moment (April 17th 2026). We can activate it later
  async benchmarkEncryptedTokenTransfer(): Promise<FeeMetrics> {
    const receipts = await getValidTransactions({
      contractAddress: CONFIDENTIAL_ETHER_PROXY,
      events: ENCRYPTED_TOKEN_TRANSFER_EVENTS,
      chain: sepolia,
      blockWindow: BLOCK_WINDOW_ETHEREUM_3_DAYS,
    });

    if (receipts.length < MIN_SAMPLES) {
      throw new Error(
        `${this.name} encrypted token transfer: receipts (${receipts.length}) < MIN_SAMPLES (${MIN_SAMPLES})`,
      );
    }

    return getAverageMetrics(receipts);
  }
}
