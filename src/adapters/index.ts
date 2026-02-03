// Export all adapters
export { RailgunAdapter } from "./railgun/RailgunAdapter";
export { TornadoCashAdapter } from "./tornado-cash/TornadoCashAdapter";
export { PrivacyPoolsAdapter } from "./privacy-pools/PrivacyPoolsAdapter";

// Export types and interfaces
export type { IProtocolAdapter, BenchmarkConfig } from "../interfaces/IProtocolAdapter";
export type {
  BenchmarkResult,
  BenchmarkScenario,
  GasMetrics,
  ProofMetrics,
  FinalityMetrics,
  AggregatedBenchmarkResults,
} from "../types/benchmark";
