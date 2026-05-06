# Gas Benchmarks

This directory contains the protocol benchmarks related to gas costs and anonymity set size. The benchmarks are fetched from a deployed subgraph and processed to be presented in the public dashboard.

# Setup

```bash

# 1. Clone the repository
git clone https://github.com/privacy-ethereum/private-transfers-benchmarks

# 2. install dependencies
cd private-transfers-benchmarks
pnpm install

# 3. Navigate to the specific directory
cd gas-benchmarks

# 4. Run the script to fetch data from the Subgraph and process it to a json file
pnpm run benchmark
```
