# Veil Cash

## Contracts

- **VeilWalletEntryV11:** is a entry point contract where users can queue (deposit) their native ETH or USDC in order to enter the private pool. This contract will verify compliance and after that a user will be able to "Accept ETH" and "Accept USDC" to move the funds to the private pool.
  - Address: [0xc2535c547B64b997A4BD9202E1663deaF11c78a5](https://basescan.org/address/0xc2535c547B64b997A4BD9202E1663deaF11c78a5)
  - Contract: [VeilWalletEntryV11](https://basescan.org/address/0xda05e2f4d544677c5c51211c60fb38d618d6a665#code)

- **ETHPool:** is the shielded pool contract that controls all shielded native ETH. Users can transact (private transfer) or withdraw ETH by interacting with this contract.
  - Address: [0x293dCda114533FF8f477271c5cA517209FFDEEe7](https://basescan.org/address/0x293dCda114533FF8f477271c5cA517209FFDEEe7)
  - Contract: [VeilETHPool](https://github.com/veildotcash/veil_pool_contracts/blob/main/src/VeilPool/VeilETHPool.sol)

- **USDCPool:** is the shielded pool contract that controls all shielded USDC. Users can transact (private transfer) or withdraw USDC by interacting with this contract.
  - Address: [0x5c50d58E49C59d112680c187De2Bf989d2a91242](https://basescan.org/address/0x5c50d58E49C59d112680c187De2Bf989d2a91242)
  - Contract: [VeilUSDCPool](https://github.com/veildotcash/veil_pool_contracts/blob/main/src/VeilPool/VeilUSDCPool.sol)

- **VeilETHQueueV3:** is the contract that controls the queue of native ETH deposits. It is called by the VeilWalletEntryV11 contract when a user deposits native ETH. This contract is responsible for emitting events related to the deposit process and for moving funds to the shielded pool after the compliance checks are passed.
  - Address: [0xA4a926A2E7a22c38e8DFC6744A61a6aA8b06B230](https://basescan.org/address/0xA4a926A2E7a22c38e8DFC6744A61a6aA8b06B230)
  - Contract: [VeilETHQueueV3](https://basescan.org/address/0xA4a926A2E7a22c38e8DFC6744A61a6aA8b06B230#code)

## Deposit

1. Sender [deposit funds](https://basescan.org/tx/0xb4fa5d5e243ebb74212f6753b69bff0972ee16278a6c3b2e9ed65898e3ce5132) into the entry contract. This action is called queue because the funds are not yet in the private pool, they are being scanned and waiting for compliance checks. The following event is emitted `DepositQueued(uint256 indexed nonce,address indexed sender,uint256 amount,bytes)` by the VeilETHQueueV3 contract which gets called by the VeilWalletEntryV11 inside the transaction.

2. Veil Operator [accepts the deposit](https://basescan.org/tx/0xd7af83ab0e841f92cb35b7b2ebae6d28dfe2bda6d7bfd7f22a189bad79dc625d) after it has passed the compliance checks. These two steps are separated because some of the compliance checks are done off-chain and they can take some time. When the operator accepts the deposit, the funds are moved to the private pool and the following event is emitted `DepositAccepted(uint256 indexed nonce,address indexed operator,address indexed veilEntry,uint256 amount)` from the `VeilETHQueueV3` contract.

## Transfer

1. User can [transfer notes inside the shielded pool](https://basescan.org/tx/0xb855d19f636916da99a41ad1c055be60dd99f9092731f58aa85bb95914337d90). A note transfer involves creating new commitments (notes) for the recipient and nullifying the sender's notes. A transaction can have multiple commitments and nullifiers, therefore a private transfer can be considered any transaction that calls the [`transactETH`](https://github.com/veildotcash/veil_pool_contracts/blob/2ee84b126f44e330365d559f66acfcc8ce2de118/src/VeilPool/VeilETHPool.sol#L108) and emits one or more `NewNullifier(bytes32 nullifier)`. If only commitments are emitted, then the transaction would be considered a deposit/mint action.

## Withdraw

1. User [withdraws](https://basescan.org/tx/0xd1ab273564036293c18791266223f51882ed3e2c249d32450da73fefd975c2da) funds from the shielded pool contract. The transaction emits `Withdraw(address indexed,uint256)` from the Wrapped ETH (WETH) contract with the src (first parameter) being the shielded pool contract address and the value (second parameter) being the amount withdrawn.

# Important notes

We are having some issues when syncing the subgraph, specifically we have found the following transactions that are throwing Out of Bounds errors:

- [Contract ETHPool emits `NewNullifier(bytes32)` at block 31476880](https://basescan.org/tx/0xccf77764e49f82bf7450986d100bd218588067ebb6fca1557f63032c256e9d2a)
- [Contract ETHPool emits `NewNullifier(bytes32)` at block 37986022](https://basescan.org/tx/0x03847ced58eaa28fbb67c9ce2933013c3fdd5fa0fc93d9583b6b622280200ae9)
- [Contract ETHPool emits `NewNullifier(bytes32)` at block 38025331](https://basescan.org/tx/0xc1f0971f0da2a08917e4fc88db3cf3a82ed316b78fc75fb604f6a1ac76d699d6)
