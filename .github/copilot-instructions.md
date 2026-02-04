# Copilot Instructions: Private Transfers Benchmarks

## Project Overview

A Hardhat-based benchmarking framework for measuring performance metrics (gas, proof generation time, finality) across privacy protocols (Railgun, Tornado Cash, Privacy Pools) on Ethereum. Uses adapter pattern for protocol abstraction.

## Key Architecture

### Adapter Pattern (Core Design)
- **Interface**: [src/interfaces/IProtocolAdapter.ts](src/interfaces/IProtocolAdapter.ts) defines `IProtocolAdapter` contract
- **Base Class**: `BaseProtocolAdapter` (mentioned in adapters) provides common utilities
- **Implementations**: [src/adapters/{railgun,tornado-cash,privacy-pools}/](src/adapters/) contain protocol-specific logic
- **Pattern**: Each adapter implements three core benchmarks: `benchmarkShield()`, `benchmarkSend()`, `benchmarkUnshield()`
- **Key Insight**: Adapters are stateful - call lifecycle methods in order: `initialize()` → `setup()` → `runAllBenchmarks()` → `cleanup()`

### Type System
- [src/types/benchmark.ts](src/types/benchmark.ts): Defines `BenchmarkResult` (umbrella type), `GasMetrics`, `ProofMetrics`, `FinalityMetrics`, `BenchmarkScenario` enum (SHIELD, SEND, UNSHIELD)
- **Critical**: Results always include gas metrics; proof/finality metrics optional depending on scenario

### Test & Benchmark Execution
- `pnpm test`: Runs [test/adapters.test.ts](test/adapters.test.ts) via Hardhat
- `pnpm benchmark`: Executes [test/run-benchmarks.ts](test/run-benchmarks.ts) - iterates all adapters, catches per-adapter failures gracefully
- Benchmarks use Hardhat's forked Sepolia network (configurable via `FORK_ENABLED` env var)

## Essential Workflows

### Adding a New Protocol Adapter
1. Create `src/adapters/{protocol-name}/{ProtocolAdapter.ts}`
2. Extend `BaseProtocolAdapter` or implement `IProtocolAdapter`
3. Implement: `setup()`, `benchmarkShield()`, `benchmarkSend()`, `benchmarkUnshield()`, `isAvailable()`, `cleanup()`
4. Return `BenchmarkResult` with populated `GasMetrics` (required) and optionally `ProofMetrics`/`FinalityMetrics`
5. Export from [src/adapters/index.ts](src/adapters/index.ts)
6. Add to adapters array in [test/run-benchmarks.ts](test/run-benchmarks.ts)

### Running Benchmarks Locally
```bash
pnpm compile          # TypeChain generates types
pnpm benchmark        # Runs all protocol benchmarks, outputs to benchmark-results/
REPORT_GAS=true pnpm test  # Show gas usage in test output
```

### Configuration
- [hardhat.config.ts](hardhat.config.ts): Network forking, gas limits (30M for privacy ops), paths
- `.env`: Must include `SEPOLIA_RPC_URL` for forking; optional `PRIVATE_KEY` for testnet deployment
- [BenchmarkConfig](src/interfaces/IProtocolAdapter.ts#L5): Controls amount, token, iterations, finality settings - passed to all adapters

## Project-Specific Conventions

### Reporting & Aggregation
- [src/utils/reporting.ts](src/utils/reporting.ts): Functions for formatting, averaging metrics (`calculateAverageGas()`, `calculateAverageProofTime()`)
- Results exported to JSON via `exportToJSON()` for external analysis
- All timestamps use milliseconds for proof/finality, wei for gas amounts

### Error Handling Pattern
- Benchmarks continue on per-adapter failure (see run-benchmarks.ts line ~44 catch block)
- Adapters should wrap protocol SDK calls in try-catch; report via `console.error()`
- Non-critical missing metrics (e.g., proof size) default to 0

### Gas Measurement
- Captured from transaction receipt (`receipt.gasUsed`)
- Effective gas price calculated for EIP-1559 transactions
- Large block/gas limits (30M) prevent OOG errors on complex operations

## Dependencies & Integration Points

- **Hardhat**: Test runner, network forking, TypeChain code generation
- **ethers v6**: Provider/signer interactions, transaction parsing
- **hardhat-gas-reporter**: Optional gas analysis
- **TypeChain**: Auto-generates types from ABIs (stored in [typechain-types/](typechain-types/))

## Development Tips

- When implementing a new adapter, use `sendPlaceholderTransaction()` from `BaseProtocolAdapter` initially to verify framework plumbing
- Gas limits are set high intentionally—don't optimize prematurely; focus on correct metrics first
- Each benchmark iteration should be independent; state should not leak between iterations
- Use `waitForFinality()` helper to handle confirmation logic consistently across adapters
