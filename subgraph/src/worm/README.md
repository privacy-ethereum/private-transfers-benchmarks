# WORM

## Contracts

- **BETH:** is a ERC20 token contract with custom functions to mint and spend Burned ETH (BETH) tokens. In order to mint BETH, users need to show a ZK proof that a burn address has received a certain amount of ETH.
  - Address: 0x5624344235607940d4d4EE76Bf8817d403EB9Cf8
  - Contract: [BETH](https://github.com/worm-privacy/worm/blob/main/src/BETH.sol)
- **WETH:** is the canonical WETH contract used in Ethereum mainnet. WORM uses this contract to swap BETH to WETH and then withdraw WETH to ETH when users want to withdraw their funds from WORM.
  - Address: 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
  - Contract: [WETH](https://github.com/gnosis/canonical-weth/blob/master/contracts/WETH9.sol)

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
   7. Swap BETH to WETH in a DEX contract
   8. Withdraw WETH to ETH
   9. Send ETH to the recipient
   10. Mint BETH tokens for the rewards pool
   11. Transfer BETH tokens to the rewards pool

   As you can see, the function performs 4 transactions: pay the prover, pay the broadcaster, pay the recipient and pay the rewards pool. Just after the contract mints BETH to the recipient, the contract swaps BETH to WETH, withdraws WETH to ETH and finally sends ETH to the recipient. All these steps are specified in the `receiverPostMintHook` bytes parameter of the `mintCoin` function. In order to retrieve all possible WORM withdraw transactions, we will scan the WETH contract for all `Withdraw` events that the caller is the BETH contract. This way we can be sure we are only retrieving WORM withdraw-ETH transactions and we are covering all different ways a user can withdraw funds from WORM (e.g. using a EOA, using a smart account, etc). We will save the transaction hash of each handled event in order to prevent duplicates where `broadcasterFeePostMintHook` and ` proverFeePostMintHook` also withdraw ETH through the WETH contract.

   You can check the function code [here](https://github.com/worm-privacy/worm/blob/a16ea70908d13ebe0d737b4ac89c4bdafad20bf1/src/BETH.sol#L165)
