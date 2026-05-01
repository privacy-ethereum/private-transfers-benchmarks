# Curvy

## Contracts

- **PortalFactory:** factory contract that deploys smart accounts into stealth address to move funds to the Privacy Aggregator contract in Arbitrum (or bridge them and move it to the Privacy Aggregator in other chains).
  - Address: 0x69D4095eA0b3E183d26ccDC7e2075A42A4591f86
  - Contract: [PortalFactory.sol](https://github.com/0xCurvy/contracts/blob/main/contracts/portal/PortalFactory.sol)

- **Privacy Aggregator:** shielded pool deployed in Arbitrum that hosts all the private funds and allow users to withdraw and privately transfer them between Curvy accounts.
  - Proxy Address: 0x9c07E1Ff4f1B96ae609331BAc327FcC2d8563224
  - Contract: [CurvyAggregatorAlphaV6.sol](https://github.com/0xCurvy/contracts/blob/main/contracts/aggregator-alpha/CurvyAggregatorAlphaV6.sol)

- **Curvy Vault:** smart contract vault that guards the shielded funds. The internal private transfers logic happen in Privacy Aggregator but the funds are stored in the Curvy Vault.
  - Address: 0xB4BA872fBa00Bc4268067D5DE4223240cEc4B6d5
  - Contract: [CurvyVault.sol](https://github.com/0xCurvy/contracts/blob/main/contracts/vault/CurvyVaultV6.sol)

## Deposit (public to stealth)

1. Sender [transfers funds](https://arbiscan.io/tx/0x8a827f7d6f40d061b0328d458458ae989abbbba801e90929884ca5e356b3aca1) to a stealth address. Looks like a normal native ETH or ERC20 transfer

2. [Curvy-owned address](https://arbiscan.io/address/0x61826700275c96633c85a6563bffcbb2e9e82dc6) calls ["Deploy Shield Portal"](https://arbiscan.io/tx/0xdfd870c0ba81399346d79f1a7d7a1e5259d216d8e29d6c843d59f75eb30ffbe9) function in PortalFactory to move funds to the Privacy Aggregator in Arbitrum. In Ethereum mainnet it calls ["Deploy Entry Bridge Portal"](https://etherscan.io/tx/0x3864a1014817c2d1556dee642c914a09c8eacfa2f3db1a66b567d20bcfc02182) function in the PortalFactory. Compliance checks are performed in this step, the example transaction took a day to be processed because of these checks.

3. Shielded funds arrive at the Privacy Aggregator and in the same transaction are sent to the Curvy Vault to be guarded. The shielded funds appear on the Curvy UI ready to be used

## Withdraw (shielded pool to public)

1. Sender transfers funds from Curvy UI (Privacy Aggregator) to a public address. The Privacy Aggregator executes ["Commit Withdrawal Batch"](https://arbiscan.io/tx/0x6d823a26c4b3f2ccb025e3efc465333403bd3381afc0f8a0326fe762acc06a81) and sends funds to the public address.

## Private transfer (shielded pool to shielded pool)

1. Sender transfers funds from Curvy UI (Privacy Aggregator) to another Curvy account. The Privacy Aggregator executes ["Commit Aggregation Batch"](https://arbiscan.io/tx/0x0dba34d3b8c60d589552b329be275895819e33baa08f2917da903ccd2e20f42c). No funds leave the shielded pool but the Curvy UI reflects the transfer.

## Not working as expected

1. I send $0.25 USDC in Ethereum Mainnet to a curvy stealth address and never appear on the Curvy UI. You can see that the funds are still trapped in the stealth address. By using the "Recovery Portal" tool I realized that there were not enough funds to pay fees for it to be bridged to the Privacy Aggregator contract in Arbitrum through LiFi: https://etherscan.io/tx/0xf347ca11d862b915d746a8502e0e7d44d8636ca507d79ca38279d1cc43b81e48

2. The same as above but with $1 USDC in Ethereum Mainnet: https://etherscan.io/tx/0x84c46d709f154f674c75864736d27910d7e141a56a82939f1f0ac892ff5316c7

Curvy should notify their users what is the minimum amount to be sent to pay fees and receive private funds in their Curvy account. In the future the benchmarks should reflect this cost as well because at the moment we are considering a Curvy deposit as a simple ERC20 transfer, but in reality you need to send enough funds to pay for fees and then bridge the remaining funds to Arbitrum.
