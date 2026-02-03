# Quick Start Guide

Get up and running with Private Transfers Benchmarks in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Basic understanding of Ethereum and TypeScript

## Installation

```bash
# Clone the repository
git clone https://github.com/privacy-ethereum/private-transfers-benchmarks.git
cd private-transfers-benchmarks

# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install
```

## Verify Installation

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Compile contracts
pnpm compile
```

## Running Your First Benchmark

### Option 1: Run Tests

```bash
pnpm test
```

### Option 2: Run Benchmark Script

```bash
pnpm benchmark
```

Results will be saved to `benchmark-results/` directory.

## Understanding the Structure

- **`adapters/`** - Protocol-specific implementations
  - `railgun/` - Railgun protocol adapter
  - `tornado-cash/` - Tornado Cash protocol adapter
  - `privacy-pools/` - Privacy Pools protocol adapter

- **`src/`** - Core framework
  - `interfaces/` - Base adapter interface
  - `types/` - TypeScript type definitions
  - `utils/` - Helper functions

- **`test/`** - Test suites

- **`scripts/`** - Utility scripts

## Next Steps

1. **Explore the Code**: Check out the adapter implementations
2. **Read CONTRIBUTING.md**: Learn how to add new protocols
3. **Run Benchmarks**: Test with different configurations
4. **Customize**: Modify benchmark parameters in scripts

## Common Commands

```bash
# Run all tests
pnpm test

# Run tests in parallel
pnpm test:parallel

# Run benchmarks
pnpm benchmark

# Check types
pnpm typecheck

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Compile contracts
pnpm compile
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key settings:
- `FORK_ENABLED` - Enable network forking
- `SEPOLIA_RPC_URL` - RPC endpoint for forking
- `REPORT_GAS` - Enable gas reporting

## Need Help?

- 📖 Read the [README](README.md) for detailed documentation
- 🤝 Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guide
- 🐛 Open an issue if you encounter problems

Happy benchmarking! 🚀
