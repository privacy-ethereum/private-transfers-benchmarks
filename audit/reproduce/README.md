# Reproduction

`reproduce.ts` measures the on-chain gas for every benchmarked protocol and operation over fixed block
ranges, so it returns the same numbers every run. It reads the per-chain RPC URLs from
`../../gas-benchmarks/.env` and `../../project-evaluations/.env`.

```
npx tsx audit/reproduce/reproduce.ts                  # all checks
npx tsx audit/reproduce/reproduce.ts privacy-pools    # one protocol by id prefix
```

For each check it pulls the event logs over the pinned range via `eth_getLogs`, groups them by
transaction to get events-per-transaction, and reads `gasUsed` from a sample of receipts; full output,
including the sampled transactions, is written to `results.json`. The block ranges are fixed in the
script. The deployed-subgraph side of each "N×" claim is not fetched here — query the subgraph aggregate
(`totalGasUsed / totalCount`) directly to reproduce the numerator.

## Result (Critical 1)

Pinned to blocks 25,340,203–25,390,203, the Privacy Pools ETH pool `0xf241d57c` reads ~11.6× its true
on-chain cost, while a control pool indexed by the same handler is correct:

| Pool                    | Subgraph avg gas | Measured avg gas | Δ      |
| ----------------------- | ---------------: | ---------------: | ------ |
| `0xf241d57c` (surfaced) |        4,619,362 |          397,515 | 11.62× |
| `0xb419c286` (control)  |          426,715 |          441,217 | 0.97×  |

Same code, one corrupted aggregate — the evidence that Critical 1 is deployed-index corruption, not a
handler bug, and that a clean re-index fixes it. `reproduce.ts` covers every benchmarked protocol and
operation; `results.json` holds the sampled transactions per check.
