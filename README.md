# Private Transfers Benchmarks

A comprehensive benchmarking suite for evaluating and comparing private transfer protocols on Ethereum. This repository provides a standardized framework for measuring gas costs, proof generation times, and finality across different privacy-preserving protocols.

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
├── src/
│   ├── adapters/               # Protocol-specific implementations
│   │   ├── railgun/            # Railgun adapter
│   │   ├── tornado-cash/       # Tornado Cash adapter
│   │   └── privacy-pools/      # Privacy Pools adapter
│   ├── interfaces/             # Common interfaces
│   │   └── IProtocolAdapter.ts # Base adapter interface
│   ├── types/                  # Type definitions
│   │   └── benchmark.ts        # Benchmark result types
│   └── utils/                  # Utility functions
│       └── reporting.ts        # Report generation utilities
├── test/                       # Test files
│   └── run-benchmarks.ts       # Benchmark runner
└── hardhat.config.ts          # Hardhat configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 8.15.0

### Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

### Configuration

Create a `.env` file in the root directory following `.env.example`

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
    blockNumber: number;
    transactionHash: string;
    confirmations: number;
    finalityTimeMs: number;
  };
  timestamp: number;
}
```

## 🤝 Contributing

Contributions are welcome! Read more in [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details
