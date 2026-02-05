/**
 * Benchmark scenario types
 */
export enum BenchmarkScenario {
  SHIELD = "shield",
  SEND = "send",
  UNSHIELD = "unshield",
}

/**
 * Gas metrics for a single operation
 */
export interface GasMetrics {
  /** Total gas used for the operation */
  gasUsed: bigint;
  /** Gas price in wei */
  gasPrice: bigint;
  /** Total cost in wei (gasUsed * gasPrice) */
  totalCost: bigint;
  /** Effective gas price (for EIP-1559 transactions) */
  effectiveGasPrice?: bigint;
}

/**
 * Proof generation metrics
 */
export interface ProofMetrics {
  /** Time to generate proof in milliseconds */
  generationTimeMs: number;
  /** Proof size in bytes */
  proofSizeBytes: number;
  /** Public inputs size in bytes */
  publicInputsSizeBytes: number;
}

/**
 * Finality metrics
 */
export interface FinalityMetrics {
  /** Block number where transaction was included */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Number of confirmations waited for */
  confirmations: number;
  /** Time to finality in milliseconds */
  finalityTimeMs: number;
}

/**
 * Complete benchmark result for a single operation
 */
export interface BenchmarkResult {
  /** Scenario being benchmarked */
  scenario: BenchmarkScenario;
  /** Protocol name */
  protocol: string;
  /** Gas metrics */
  gas: GasMetrics;
  /** Proof generation metrics (if applicable) */
  proof?: ProofMetrics;
  /** Finality metrics */
  finality: FinalityMetrics;
  /** Timestamp when benchmark was run */
  timestamp: number;
  /** Any additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Aggregated benchmark results
 */
export interface AggregatedBenchmarkResults {
  /** Protocol name */
  protocol: string;
  /** Results for shield operations */
  shield: BenchmarkResult[];
  /** Results for send operations */
  send: BenchmarkResult[];
  /** Results for unshield operations */
  unshield: BenchmarkResult[];
  /** Summary statistics */
  summary: {
    totalRuns: number;
    averageGasUsed: Record<BenchmarkScenario, bigint>;
    averageProofTimeMs: Record<BenchmarkScenario, number>;
    averageFinalityMs: Record<BenchmarkScenario, number>;
  };
}

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
