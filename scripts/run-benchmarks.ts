import { ethers } from "hardhat";
import { RailgunAdapter } from "../adapters/railgun";
import { TornadoCashAdapter } from "../adapters/tornado-cash";
import { PrivacyPoolsAdapter } from "../adapters/privacy-pools";
import { BenchmarkConfig } from "../src/interfaces/IProtocolAdapter";
import { generateSummaryReport, exportToJSON } from "../src/utils/reporting";
import * as fs from "fs";
import * as path from "path";

/**
 * Run benchmarks for all protocols
 */
async function main() {
  console.log("🚀 Starting Private Transfer Benchmarks\n");

  // Configuration
  const config: BenchmarkConfig = {
    amount: ethers.parseEther("0.1"),
    tokenAddress: ethers.ZeroAddress, // Native ETH
    iterations: 3, // Run each scenario 3 times
    waitForFinality: true,
    confirmations: 1,
  };

  // Initialize adapters
  const adapters = [
    new RailgunAdapter(),
    new TornadoCashAdapter(),
    new PrivacyPoolsAdapter(),
  ];

  const allResults = [];

  // Run benchmarks for each adapter
  for (const adapter of adapters) {
    console.log(`\n📊 Benchmarking ${adapter.name}...`);
    console.log("=".repeat(50));

    try {
      // Initialize adapter
      await adapter.initialize(ethers.provider, config);

      // Check if protocol is available
      const available = await adapter.isAvailable();
      if (!available) {
        console.log(`⚠️  ${adapter.name} is not available on this network. Skipping...`);
        continue;
      }

      // Setup
      console.log(`Setting up ${adapter.name}...`);
      await adapter.setup();

      // Run benchmarks
      console.log(`Running benchmarks for ${adapter.name}...`);
      const results = await adapter.runAllBenchmarks();
      allResults.push(...results);

      // Display results
      console.log(`\n✅ ${adapter.name} benchmarks completed!`);
      console.log(`Total operations: ${results.length}`);

      // Cleanup
      await adapter.cleanup();
    } catch (error) {
      console.error(`❌ Error benchmarking ${adapter.name}:`, error);
    }
  }

  // Generate reports
  console.log("\n" + "=".repeat(50));
  console.log("📈 BENCHMARK SUMMARY");
  console.log("=".repeat(50) + "\n");

  if (allResults.length > 0) {
    // Print summary to console
    const summary = generateSummaryReport(allResults);
    console.log(summary);

    // Save results to JSON file
    const resultsDir = path.join(__dirname, "..", "benchmark-results");
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const jsonPath = path.join(resultsDir, `results-${timestamp}.json`);
    fs.writeFileSync(jsonPath, exportToJSON(allResults));
    console.log(`\n💾 Results saved to: ${jsonPath}`);

    // Save summary report
    const summaryPath = path.join(resultsDir, `summary-${timestamp}.txt`);
    fs.writeFileSync(summaryPath, summary);
    console.log(`💾 Summary saved to: ${summaryPath}`);
  } else {
    console.log("⚠️  No benchmark results to report.");
  }

  console.log("\n✨ Benchmarking complete!\n");
}

// Execute main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
