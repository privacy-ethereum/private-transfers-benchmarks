# Subgraph

Build the required subgraph to fetch metrics data for the benchmarks.

# Build and deploy

```bash
# 0. merge the schema files into a single one
# happens automatically because of hook "precodegen" in package.json
# 1. generate the code types for the subgraph
NETWORK=mainnet pnpm run codegen
NETWORK=sepolia pnpm run codegen


# 2. build the subgraph
NETWORK=mainnet pnpm run build
NETWORK=sepolia pnpm run build

# 3. Authenticate graph CLI
graph auth <DEPLOY_KEY_DIFFERENT_FROM_API_KEY>

# 4. deploy the subgraph to The Graph Studio
NETWORK=mainnet pnpm run deploy
NETWORK=sepolia pnpm run deploy

# On Windows use:
$env:NETWORK="<NETWORK_NAME>"; pnpm run <COMMAND>
```

**Note**: A subgraph can only point to one network at the time. We need multiple subgraph.yaml files for each network. More info [here](https://thegraph.com/docs/en/subgraphs/developing/creating/subgraph-manifest/#subgraph-capabilities).

# Test prerequisites

`graph test` uses Matchstick. On Linux, the Matchstick binary depends on the PostgreSQL client shared library `libpq.so.5`.

Install it before running tests:

```bash
sudo apt install postgresql
# or, if you only want the runtime library
sudo apt install libpq5
```

## Running tests

Unit tests live in `tests/` and run against a minimal dummy `subgraph.yaml`.

```bash
# Or run all tests
pnpm run test
```
