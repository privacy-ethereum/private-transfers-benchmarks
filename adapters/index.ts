// Export all adapters
export { RailgunAdapter } from "./railgun";
export { TornadoCashAdapter } from "./tornado-cash";
export { PrivacyPoolsAdapter } from "./privacy-pools";

// Export types and interfaces
export type { IProtocolAdapter, BenchmarkConfig } from "../src/interfaces/IProtocolAdapter";
export type {
  BenchmarkResult,
  BenchmarkScenario,
  GasMetrics,
  ProofMetrics,
  FinalityMetrics,
  AggregatedBenchmarkResults,
} from "../src/types/benchmark";
