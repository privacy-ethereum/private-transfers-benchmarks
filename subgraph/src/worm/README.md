# WORM

## Contracts

- **BETH:** is a ERC20 token contract with custom functions to mint and spend Burned ETH (BETH) tokens. In order to mint BETH, users need to show a ZK proof that a burn address has received a certain amount of ETH.
  - Address: 0x5624344235607940d4d4EE76Bf8817d403EB9Cf8
  - Contract: [BETH](https://github.com/worm-privacy/worm/blob/main/src/BETH.sol)

## Deposit (public to burn)

1. Sender [transfers funds](https://etherscan.io/tx/0x85e79d05c72593bee8d00a430c6566c18a90ec946e9cc9296efb98add74f3f57) to a burn address. Looks like a normal native ETH or ERC20 transfer.

## Withdraw (mint BETH, swap BETH to ETH, send ETH to public)

1. Relayer sends a ["Mint Coin"](https://etherscan.io/tx/0xd061205b90ce8bcb8a8b5c8d279e0f3bf03ae9a75c9954b2297fb8933e1ecc1d) to the BETH contract to executed the withdrawal steps:
   1. Verify the ZK proof
   2. Mint BETH tokens for the prover
   3. Transfer BETH tokens to the prover
   4. Mint BETH tokens for the broadcaster
   5. Transfer BETH tokens to the broadcaster
   6. Mint BETH tokens for the recipient
   7. Swap BETH to ETH in a DEX
   8. Send ETH to the recipient
   9. Mint BETH tokens for the rewards pool
   10. Transfer BETH tokens to the rewards pool

   You can check the function code [here](https://github.com/worm-privacy/worm/blob/a16ea70908d13ebe0d737b4ac89c4bdafad20bf1/src/BETH.sol#L165)
