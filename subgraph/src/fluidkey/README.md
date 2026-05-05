# Fluidkey

## Contracts

- **Smart Account Relayer:** is a contract that relays transactions that deploy stealth addresses and move funds to the recipients. There is no open source code for the relayer contract (searched in Fluidkey repo, Safe repo and Gelato repos).
  - Address: 0x8090a9DB6Aca56fFA186C75Ca0787B18af1058a0
  - Contract: [SmartAccountRelayer.sol](https://www.codeslaw.app/contracts/arbitrum/0x7f3319f55ef4a96ae717c5ac27b5adb0435a9280?file=src%2FSmartAccountRelayer.sol). Not official but has the same ABI as the deployed one

- **Safe: Singleton 1.3.0:** is the contract deployed at the stealth address that allows to move funds to the recipient. The deployment and fund transfer actions are performed in the same transaction.
  - Address: [0x1ADced4eB9a9e6f5244d43fAbC3e685Bf12beF51](https://etherscan.io/address/0x1adced4eb9a9e6f5244d43fabc3e685bf12bef51). Example of a deployed stealth address.
  - Contract: [Safe Singleton 1.3.0](https://etherscan.io/address/0xd9db270c1b5e3bd161e8c8503c55ceabee709552#code)

## Deposit (public to stealth)

1. Sender [transfers funds](https://etherscan.io/tx/0xe4be0700a48ba1182cbd6dd304ea555de0169aa904cde5466d9d8d23fcdb794d) to a stealth address. Looks like a normal native ETH or ERC20 transfer.

## Withdraw (stealth to public)

1. Sender transfers funds from Fluidkey UI (stealth address) to a public address. The Smart Account Relayer executes ["Relay Operation"](https://etherscan.io/tx/0x8a63395db9779ab66661653be4ffe2a15bd5df345d9389ec12f7bd44bb07f7d4) to deploy the Safe contract in the stealth address and move funds to the recipient in the same transaction. It also [pays a fee](https://etherscan.io/address/0xd55260994bea955fbf51e3942736e4a34b8469e0) to the relayer.

2. Here is an [example transaction](https://etherscan.io/tx/0xf10db1f5474b8ef4592fa95abef49e73f53f5c2773297dade0d8e209176f7aec) of a ERC20 token withdrawal from stealth address to public address. It contains one more log: Transfer event for the ERC20 token transfer.
