// Export all adapters
export { RailgunAdapter } from "./railgun/RailgunAdapter";

// Export types and interfaces
export { BenchmarkScenario } from "../types/benchmark";
export type { IProtocolAdapter, BenchmarkConfig } from "../interfaces/IProtocolAdapter";
export type {
  BenchmarkResult,
  GasMetrics,
  ProofMetrics,
  FinalityMetrics,
  AggregatedBenchmarkResults,
} from "../types/benchmark";
