# Private Transfers Benchmarks

A comprehensive benchmarking suite for evaluating and comparing private transfer protocols on Ethereum. This repository provides a standardized framework for measuring gas costs, proof generation times, and finality across different privacy-preserving protocols.

> 🚀 **New here?** Check out the [Quick Start Guide](QUICKSTART.md) to get up and running in 5 minutes!

## 🎯 Overview

This project benchmarks three major private transfer protocols:
- **Railgun** - Zero-knowledge privacy system for private transfers and DeFi
- **Tornado Cash** - Privacy solution using zk-SNARKs for unlinkable transactions
- **Privacy Pools** - Enhanced privacy with provable dissociation from bad actors

## 📊 Metrics Measured

For each protocol, we measure three core scenarios:

### 1. Shield (Deposit)
- **Gas Used**: Total gas consumed for depositing funds into the privacy pool
- **Proof Generation Time**: Time to generate commitment/proof
- **Finality Time**: Time until transaction is confirmed

### 2. Send (Private Transfer)
- **Gas Used**: Total gas consumed for private transfer within the pool
- **Proof Generation Time**: Time to generate zero-knowledge proof
- **Finality Time**: Time until transaction is confirmed

### 3. Unshield (Withdraw)
- **Gas Used**: Total gas consumed for withdrawing from the privacy pool
- **Proof Generation Time**: Time to generate withdrawal proof
- **Finality Time**: Time until transaction is confirmed

## 🏗️ Architecture

```
private-transfers-benchmarks/
├── adapters/                    # Protocol-specific implementations
│   ├── railgun/                # Railgun adapter
│   ├── tornado-cash/           # Tornado Cash adapter
│   └── privacy-pools/          # Privacy Pools adapter
├── src/
│   ├── interfaces/             # Common interfaces
│   │   └── IProtocolAdapter.ts # Base adapter interface
│   ├── types/                  # Type definitions
│   │   └── benchmark.ts        # Benchmark result types
│   └── utils/                  # Utility functions
│       └── reporting.ts        # Report generation utilities
├── test/                       # Test files
└── hardhat.config.ts          # Hardhat configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

### Configuration

Create a `.env` file in the root directory:

```env
# Optional: Fork from a specific network
FORK_ENABLED=false
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Optional: For mainnet testing (not recommended for benchmarks)
PRIVATE_KEY=your_private_key_here

# Optional: Enable gas reporting
REPORT_GAS=true
```

## 🧪 Running Benchmarks

### Run Benchmark Script

Run all protocol benchmarks and generate reports:

```bash
pnpm benchmark
```

This will:
- Run benchmarks for all available protocols
- Generate JSON results file with detailed metrics
- Create a summary report
- Save results to `benchmark-results/` directory

### Run All Tests

```bash
pnpm test
```

### Run Tests in Parallel

```bash
pnpm test:parallel
```

### Run Specific Adapter Tests

```bash
# Test Railgun adapter
pnpm hardhat test test/adapters.test.ts --grep "Railgun"

# Test Tornado Cash adapter
pnpm hardhat test test/adapters.test.ts --grep "Tornado Cash"

# Test Privacy Pools adapter
pnpm hardhat test test/adapters.test.ts --grep "Privacy Pools"
```

### Enable Gas Reporting

```bash
REPORT_GAS=true pnpm test
```

## 📝 Development

### Adding a New Protocol Adapter

1. Create a new directory under `adapters/`:
```bash
mkdir adapters/your-protocol
```

2. Create an adapter class extending `BaseProtocolAdapter`:
```typescript
import { BaseProtocolAdapter } from "../../src/interfaces/IProtocolAdapter";
import { BenchmarkResult, BenchmarkScenario } from "../../src/types/benchmark";

export class YourProtocolAdapter extends BaseProtocolAdapter {
  readonly name = "YourProtocol";
  readonly version = "1.0.0";

  async setup(): Promise<void> {
    // Protocol-specific setup
  }

  async benchmarkShield(): Promise<BenchmarkResult> {
    // Implement shield/deposit logic
  }

  async benchmarkSend(): Promise<BenchmarkResult> {
    // Implement private transfer logic
  }

  async benchmarkUnshield(): Promise<BenchmarkResult> {
    // Implement unshield/withdraw logic
  }

  async isAvailable(): Promise<boolean> {
    // Check if protocol is available on current network
  }
}
```

3. Export your adapter in `adapters/index.ts`

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

## 🔬 Testing Strategy

- **Local Testnet**: All tests run on Hardhat's local network
- **Forking**: Optional forking from Sepolia or Goerli for realistic testing
- **Independence**: Each adapter is independent and can be benchmarked in parallel
- **SDK Integration**: Adapters use protocol SDKs when available

## 📈 Understanding Results

Benchmark results are structured as follows:

```typescript
interface BenchmarkResult {
  scenario: "shield" | "send" | "unshield";
  protocol: string;
  gas: {
    gasUsed: bigint;
    gasPrice: bigint;
    totalCost: bigint;
  };
  proof?: {
    generationTimeMs: number;
    proofSizeBytes: number;
  };
  finality: {
    blockNumber: bigint;
    transactionHash: string;
    confirmations: number;
    finalityTimeMs: number;
  };
  timestamp: number;
}
```

## 🤝 Contributing

Contributions are welcome! Please ensure:

1. All tests pass: `pnpm test`
2. Code is properly typed: `pnpm typecheck`
3. Code follows style guidelines: `pnpm lint`
4. New adapters include comprehensive tests

## ⚠️ Current Status

This repository is in active development. The adapter implementations are currently placeholders and need to be completed with actual protocol integrations.

### TODO:
- [ ] Implement actual Railgun integration
- [ ] Implement actual Tornado Cash integration
- [ ] Implement actual Privacy Pools integration
- [ ] Add comparative reporting across protocols
- [ ] Add visualization of benchmark results
- [ ] Add CI/CD pipeline for automated benchmarking

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🔗 Resources

- [Railgun Documentation](https://docs.railgun.org/)
- [Tornado Cash Documentation](https://docs.tornado.cash/)
- [Privacy Pools Paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364)
- [Hardhat Documentation](https://hardhat.org/docs)
