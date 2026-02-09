-include .env

.PHONY: benchmark snapshot snapshot-check cast-gas install

TX_HASH := 0x105e408f09685adccb1554a325710e90859efcd488fdb2912c8974e73b803cbd

## Run the gas benchmark
benchmark:
	forge test --match-contract RailgunTransactBenchmark -vv

## Generate .gas-snapshot
snapshot:
	forge snapshot --match-contract RailgunTransactBenchmark

## Check gas snapshot for regressions
snapshot-check:
	forge snapshot --match-contract RailgunTransactBenchmark --check

## Compare against real tx using cast
cast-gas:
	@echo "--- Real transaction ---"
	@cast tx $(TX_HASH) --rpc-url $(ETH_RPC_URL) --json \
		| jq '{hash: .hash, gasUsed: .gas, blockNumber: .blockNumber}'
	@echo ""
	@echo "--- Receipt gas ---"
	@cast receipt $(TX_HASH) --rpc-url $(ETH_RPC_URL) --json \
		| jq '{gasUsed: .gasUsed, effectiveGasPrice: .effectiveGasPrice, status: .status}'

## Install dependencies
install:
	forge install
