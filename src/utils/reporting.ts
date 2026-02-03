import { BenchmarkResult, BenchmarkScenario } from "../types/benchmark";

/**
 * Format gas metrics for display
 */
export function formatGasMetrics(result: BenchmarkResult): string {
  const gasUsed = result.gas.gasUsed.toString();
  const gasCostEth = Number(result.gas.totalCost) / 1e18;

  return `Gas Used: ${gasUsed}, Cost: ${gasCostEth.toFixed(6)} ETH`;
}

/**
 * Format proof metrics for display
 */
export function formatProofMetrics(result: BenchmarkResult): string {
  if (!result.proof) {
    return "No proof metrics available";
  }

  return `Proof Time: ${result.proof.generationTimeMs}ms, Size: ${result.proof.proofSizeBytes} bytes`;
}

/**
 * Calculate average gas used for a set of results
 */
export function calculateAverageGas(results: BenchmarkResult[]): bigint {
  if (results.length === 0) return BigInt(0);

  const total = results.reduce((sum, r) => sum + r.gas.gasUsed, BigInt(0));
  return total / BigInt(results.length);
}

/**
 * Calculate average proof generation time
 */
export function calculateAverageProofTime(results: BenchmarkResult[]): number {
  const withProofs = results.filter(r => r.proof !== undefined);

  if (withProofs.length === 0) return 0;

  const total = withProofs.reduce((sum, r) => sum + (r.proof?.generationTimeMs || 0), 0);
  return total / withProofs.length;
}

/**
 * Calculate average finality time
 */
export function calculateAverageFinalityTime(results: BenchmarkResult[]): number {
  if (results.length === 0) return 0;

  const total = results.reduce((sum, r) => sum + r.finality.finalityTimeMs, 0);
  return total / results.length;
}

/**
 * Group results by scenario
 */
export function groupByScenario(results: BenchmarkResult[]): Record<BenchmarkScenario, BenchmarkResult[]> {
  return results.reduce((acc, result) => {
    if (!acc[result.scenario]) {
      acc[result.scenario] = [];
    }

    acc[result.scenario].push(result);

    return acc;
  }, {} as Record<BenchmarkScenario, BenchmarkResult[]>);
}

/**
 * Export results to JSON
 */
export function exportToJSON(results: BenchmarkResult[]): string {
  return JSON.stringify(results, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2);
}

/**
 * Generate summary report
 */
export function generateSummaryReport(results: BenchmarkResult[]): string {
  const grouped = groupByScenario(results);
  let report = "=== Benchmark Summary ===\n\n";

  for (const [scenario, scenarioResults] of Object.entries(grouped)) {
    if (scenarioResults.length === 0) continue;

    report += `${scenario.toUpperCase()}:\n`;
    report += `  Runs: ${scenarioResults.length}\n`;
    report += `  Avg Gas: ${calculateAverageGas(scenarioResults)}\n`;
    report += `  Avg Proof Time: ${calculateAverageProofTime(scenarioResults).toFixed(2)}ms\n`;
    report += `  Avg Finality: ${calculateAverageFinalityTime(scenarioResults).toFixed(2)}ms\n`;
    report += "\n";
  }

  return report;
}
