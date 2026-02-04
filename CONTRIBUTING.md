# Contributing to Private Transfers Benchmarks

Thank you for your interest in contributing to the Private Transfers Benchmarks project! This document provides guidelines for contributing to the repository.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding a New Protocol Adapter](#adding-a-new-protocol-adapter)
- [Testing Guidelines](#testing-guidelines)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Please be respectful and professional in all interactions. We aim to maintain an inclusive and welcoming environment for all contributors.

## Getting Started

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/private-transfers-benchmarks.git
   cd private-transfers-benchmarks
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a new branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Before Making Changes

1. **Type check**: Ensure your code passes TypeScript checks
   ```bash
   pnpm typecheck
   ```

2. **Lint**: Check code style
   ```bash
   pnpm lint
   ```

3. **Run tests**: Ensure existing tests pass
   ```bash
   pnpm test
   ```

### Making Changes

1. Make your changes in a feature branch
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure all checks pass:
   ```bash
   pnpm typecheck && pnpm lint && pnpm test
   ```

## Adding a New Protocol Adapter

To add support for a new privacy protocol:

### 1. Create Adapter Directory

```bash
mkdir -p src/adapters/your-protocol
```

### 2. Implement the Adapter

Create `src/adapters/your-protocol/YourProtocolAdapter.ts`:

```typescript
import { BaseProtocolAdapter } from "../../interfaces/IProtocolAdapter";
import { BenchmarkResult, BenchmarkScenario } from "../../types/benchmark";

export class YourProtocolAdapter extends BaseProtocolAdapter {
  readonly name = "YourProtocol";
  readonly version = "1.0.0";

  async setup(): Promise<void> {
    // Initialize protocol-specific requirements
    // - Connect to contracts
    // - Set up accounts
    // - Prepare initial state
  }

  async benchmarkShield(): Promise<BenchmarkResult> {
    // Implement deposit/shield operation
    const startProof = Date.now();
    // Generate proof here
    const proofTime = Date.now() - startProof;

    // Execute transaction
    const tx = await this.executeShieldTransaction();
    const { receipt, finalityTimeMs } = await this.waitForTransaction(
      tx.hash,
      this.config?.confirmations || 1
    );

    return {
      scenario: BenchmarkScenario.SHIELD,
      protocol: this.name,
      gas: this.getGasMetrics(receipt),
      proof: {
        generationTimeMs: proofTime,
        proofSizeBytes: calculateProofSize(), // Implement this
        publicInputsSizeBytes: calculateInputsSize(), // Implement this
      },
      finality: {
        blockNumber: receipt.blockNumber,
        transactionHash: receipt.hash,
        confirmations: this.config?.confirmations || 1,
        finalityTimeMs,
      },
      timestamp: Date.now(),
    };
  }

  async benchmarkSend(): Promise<BenchmarkResult> {
    // Implement private transfer operation
  }

  async benchmarkUnshield(): Promise<BenchmarkResult> {
    // Implement withdrawal/unshield operation
  }

  async isAvailable(): Promise<boolean> {
    // Check if protocol contracts are deployed
    // on the current network
    return true; // or false
  }
}
```

### 3. Add to Main Adapter Index

Update `src/adapters/index.ts`:

```typescript
export { YourProtocolAdapter } from "../src/adapters/your-protocol/YourProtocolAdapter";
```

### 4. Add Tests

Create tests in `test/your-protocol.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { YourProtocolAdapter } from "../adapters/your-protocol";
import { BenchmarkConfig } from "../src/interfaces/IProtocolAdapter";

describe("YourProtocol Adapter", function () {
  let adapter: YourProtocolAdapter;
  let benchmarkConfig: BenchmarkConfig;

  before(async function () {
    benchmarkConfig = {
      amount: ethers.parseEther("0.1"),
      tokenAddress: ethers.ZeroAddress,
      iterations: 1,
      waitForFinality: true,
      confirmations: 1,
    };
  });

  beforeEach(async function () {
    adapter = new YourProtocolAdapter();
    await adapter.initialize(ethers.provider, benchmarkConfig);
  });

  it("should initialize correctly", async function () {
    expect(adapter.name).to.equal("YourProtocol");
  });

  it("should benchmark shield operation", async function () {
    await adapter.setup();
    const result = await adapter.benchmarkShield();
    expect(result.scenario).to.equal("shield");
    expect(result.gas.gasUsed).to.be.greaterThan(BigInt(0));
  });
});
```

## Testing Guidelines

### Test Structure

- Unit tests should cover individual adapter methods
- Integration tests should test complete benchmark flows
- Use meaningful test descriptions

### Best Practices

1. **Test Independence**: Each test should be independent and not rely on other tests
2. **Mock External Dependencies**: Use mocks for external services when possible
3. **Clear Assertions**: Make assertions specific and meaningful
4. **Test Edge Cases**: Include tests for error conditions and edge cases

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm hardhat test test/your-protocol.test.ts

# Run with gas reporting
REPORT_GAS=true pnpm test

# Run in parallel
pnpm test:parallel
```
## Questions?

If you have questions or need help, feel free to:
- Open an issue for discussion
- Reach out to the maintainers

Thank you for contributing! 🙏
