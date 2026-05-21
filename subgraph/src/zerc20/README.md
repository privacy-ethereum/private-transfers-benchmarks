# ZERC20

## Contracts

1. **LiquidityManager:** is the custodial contract that holds token liquidity and mints/burns zERC20 tokens based on wrap/unwrap flows. The zERC20 token smart contract is separated from the LiquidityManager contract, the LiquidityManager contract only does the wrap/unwrap to the respective receivers.
   - Address: [0xcC10b7098FEf1aB2f0FF3bE91d2A7B3230b90CF0](https://etherscan.io/address/0xcc10b7098fef1ab2f0ff3be91d2a7b3230b90cf0)
   - Contract: [LiquidityManager](https://github.com/zerc20io/zERC20/blob/main/contracts/src/liquidity/LiquidityManager.sol)

2. **zERC20:** is the ERC20 token contract that represents the wrapped tokens. It has the standard ERC20 token functions (e.g.) and an additional teleport function that allows minting tokens by proving ownership of a burn transaction. The teleport function is used for private transfers, where the sender burns zERC20 tokens to a burn address and the receiver can claim those tokens by proving ownership of the burn transaction.
   - Address: [0x410056c6f0a9abd8c42b9eef3bb451966fb0d924](https://etherscan.io/token/0x410056c6f0a9abd8c42b9eef3bb451966fb0d924)
   - Contract: [zERC20](https://github.com/zerc20io/zERC20/blob/main/contracts/src/zERC20.sol)

## Wrap

1. Sender [interacts with the LiquidityManager contract](https://etherscan.io/tx/0x53ff817fca9f5f299d0cfb13d481e22ab2acc36fedc91dfa65ad41ca40706f19), sends ETH to the contract and zERC20 gets minted to his account. All this in a single transaction

## Private Transfer

1. Sender [sends a zERC20 transfer](https://etherscan.io/tx/0xdbde649394d7fbbca61f9d9cece2296fbc7be51b3edb296c5c2f6272d86f0216) to a burn address. To the public observers it looks like a normal address holding zERC20 tokens.

2. Receiver needs to [claim the funds](https://etherscan.io/tx/0x74ecea93bd7f47592676837088f4b374cbff0cba2fb015fa8428e90f6845f43e) using a gasless relayer. The receiver will click on the UI and a transaction from the relayer will be sent to move the zERC20 tokens to the receiver's address.

## Unwrap

1. Receiver unwraps [zERC20 tokens](https://etherscan.io/tx/0x7fd9cfad57ce6f188453124214ea0279edc84a4334a297cfc893ec2497129f90) to public tokens (native ETH or ERC20 tokens) by interacting with the LiquidityManager contract.
