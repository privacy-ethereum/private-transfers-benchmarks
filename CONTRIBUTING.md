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

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Basic understanding of Ethereum and zero-knowledge proofs

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
mkdir -p adapters/your-protocol
```

### 2. Implement the Adapter

Create `adapters/your-protocol/YourProtocolAdapter.ts`:

```typescript
import { BaseProtocolAdapter } from "../../src/interfaces/IProtocolAdapter";
import { BenchmarkResult, BenchmarkScenario } from "../../src/types/benchmark";

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

### 3. Create Index File

Create `adapters/your-protocol/index.ts`:

```typescript
export { YourProtocolAdapter } from "./YourProtocolAdapter";
```

### 4. Add to Main Adapter Index

Update `adapters/index.ts`:

```typescript
export { YourProtocolAdapter } from "./your-protocol";
```

### 5. Add Tests

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

### 6. Update Documentation

- Add your protocol to the README.md
- Document any specific requirements or configuration
- Add links to protocol documentation

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

## Code Style

### TypeScript Guidelines

1. **Type Safety**: Use explicit types, avoid `any`
2. **Async/Await**: Prefer async/await over promises
3. **Error Handling**: Always handle errors appropriately
4. **Comments**: Add JSDoc comments for public APIs

### Naming Conventions

- **Files**: PascalCase for classes, kebab-case for utilities
- **Classes**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase with `I` prefix

### Formatting

We use ESLint for code formatting. Run:

```bash
pnpm lint:fix
```

## Pull Request Process

1. **Update Documentation**: Ensure README and other docs are updated
2. **Add Tests**: Include tests for new functionality
3. **Pass All Checks**: Ensure typecheck, lint, and tests pass
4. **Clear Description**: Write a clear PR description explaining:
   - What changes were made
   - Why the changes were needed
   - How to test the changes

5. **Small PRs**: Keep PRs focused on a single feature or fix
6. **Respond to Feedback**: Address review comments promptly

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] TypeScript checks pass (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Commit messages are clear and descriptive

## Questions?

If you have questions or need help, feel free to:
- Open an issue for discussion
- Reach out to the maintainers

Thank you for contributing! 🙏
