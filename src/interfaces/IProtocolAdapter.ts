import { BenchmarkResult } from "../types/benchmark";
import { ethers } from "ethers";

/**
 * Configuration for running benchmarks
 */
export interface BenchmarkConfig {
  /** Amount to transfer (in wei or smallest token unit) */
  amount: bigint;
  /** Token address (use zero address for native ETH) */
  tokenAddress: string;
  /** Number of iterations to run for each scenario */
  iterations: number;
  /** Whether to wait for finality */
  waitForFinality: boolean;
  /** Number of confirmations to wait for */
  confirmations: number;
}

/**
 * Base interface that all protocol adapters must implement
 */
export interface IProtocolAdapter {
  /** Protocol name */
  readonly name: string;

  /** Protocol version */
  readonly version: string;

  /**
   * Initialize the adapter with provider and configuration
   * @param provider Ethereum provider
   * @param config Benchmark configuration
   */
  initialize(provider: ethers.Provider, config: BenchmarkConfig): Promise<void>;

  /**
   * Setup necessary accounts, contracts, and initial state
   */
  setup(): Promise<void>;

  /**
   * Benchmark the shield operation (depositing into privacy pool)
   * @returns Benchmark result for shield operation
   */
  benchmarkShield(): Promise<BenchmarkResult>;

  /**
   * Benchmark the send operation (private transfer within pool)
   * @returns Benchmark result for send operation
   */
  benchmarkSend(): Promise<BenchmarkResult>;

  /**
   * Benchmark the unshield operation (withdrawing from privacy pool)
   * @returns Benchmark result for unshield operation
   */
  benchmarkUnshield(): Promise<BenchmarkResult>;

  /**
   * Run all benchmark scenarios
   * @returns Array of benchmark results
   */
  runAllBenchmarks(): Promise<BenchmarkResult[]>;

  /**
   * Cleanup any resources or state
   */
  cleanup(): Promise<void>;

  /**
   * Check if the protocol is available on the current network
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Helper base class for adapters
 */
export abstract class BaseProtocolAdapter implements IProtocolAdapter {
  abstract readonly name: string;
  abstract readonly version: string;

  protected provider?: ethers.Provider;
  protected config?: BenchmarkConfig;
  protected signer?: ethers.Signer;

  async initialize(provider: ethers.Provider, config: BenchmarkConfig): Promise<void> {
    this.provider = provider;
    this.config = config;

    // Get a signer from the provider
    if ("getSigner" in provider && typeof (provider as ethers.JsonRpcProvider).getSigner === "function") {
      this.signer = await (provider as ethers.JsonRpcProvider).getSigner();
    }
  }

  abstract setup(): Promise<void>;
  abstract benchmarkShield(): Promise<BenchmarkResult>;
  abstract benchmarkSend(): Promise<BenchmarkResult>;
  abstract benchmarkUnshield(): Promise<BenchmarkResult>;
  abstract isAvailable(): Promise<boolean>;

  async runAllBenchmarks(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    // Run each scenario multiple times based on config
    if (!this.config) {
      throw new Error("Adapter not initialized");
    }

    for (let i = 0; i < this.config.iterations; i++) {
      results.push(await this.benchmarkShield());
      results.push(await this.benchmarkSend());
      results.push(await this.benchmarkUnshield());
    }

    return results;
  }

  async cleanup(): Promise<void> {
    this.provider = undefined;
    this.config = undefined;
    this.signer = undefined;
  }

  /**
   * Helper method to wait for transaction and measure finality
   */
  protected async waitForTransaction(
    txHash: string,
    confirmations: number = 1
  ): Promise<{ receipt: ethers.TransactionReceipt; finalityTimeMs: number }> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const startTime = Date.now();
    const receipt = await this.provider.waitForTransaction(txHash, confirmations);
    const finalityTimeMs = Date.now() - startTime;

    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    return { receipt, finalityTimeMs };
  }

  /**
   * Helper method to extract gas metrics from transaction receipt
   */
  protected getGasMetrics(receipt: ethers.TransactionReceipt) {
    return {
      gasUsed: receipt.gasUsed,
      gasPrice: receipt.gasPrice,
      totalCost: receipt.gasUsed * receipt.gasPrice,
      effectiveGasPrice: receipt.gasPrice,
    };
  }
}
