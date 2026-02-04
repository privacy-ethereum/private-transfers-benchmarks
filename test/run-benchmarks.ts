import { RailgunAdapter } from "../src/adapters";
import { BenchmarkConfig } from "../src/interfaces/IProtocolAdapter";
import { generateSummaryReport, exportToJSON } from "../src/utils/reporting";
import * as fs from "fs";
import * as path from "path";
import { parseEther, ZeroAddress } from "ethers";
import { ethers } from "hardhat";
/**
 * Run benchmarks for all protocols
 */
async function main() {
  const provider = ethers.provider;

  const config: BenchmarkConfig = {
    amount: parseEther("0.1"),
    tokenAddress: ZeroAddress, // Native ETH
    iterations: 3, // Run each scenario 3 times
    waitForFinality: true,
    confirmations: 1,
  };

  const adapters = [
    new RailgunAdapter(),
  ];

  const allResults = [];

  for (const adapter of adapters) {
    console.log(`\n📊 Benchmarking ${adapter.name}...`);
    console.log("=".repeat(50));

    try {
      await adapter.initialize(provider, config);

      const available = await adapter.isAvailable();

      if (!available) {
        console.log(`⚠️  ${adapter.name} is not available on this network. Skipping...`);
        continue;
      }

      console.log(`Setting up ${adapter.name}...`);

      await adapter.setup();

      console.log(`Running benchmarks for ${adapter.name}...`);

      const results = await adapter.runAllBenchmarks();

      allResults.push(...results);

      console.log(`\n✅ ${adapter.name} benchmarks completed with ${results.length} operations!`);

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
    const summary = generateSummaryReport(allResults);

    console.log(summary);

    const resultsDir = path.join(__dirname, "..", "benchmark-results");

    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const jsonPath = path.join(resultsDir, `results-${timestamp}.json`);

    fs.writeFileSync(jsonPath, exportToJSON(allResults));
    console.log(`\n💾 Results saved to: ${jsonPath}`);

    const summaryPath = path.join(resultsDir, `summary-${timestamp}.txt`);

    fs.writeFileSync(summaryPath, summary);

    console.log(`💾 Summary saved to: ${summaryPath}`);
  } else {
    console.log("⚠️  No benchmark results to report.");
  }

  console.log("\n✨ Benchmarking complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);

    process.exit(1);
  });
