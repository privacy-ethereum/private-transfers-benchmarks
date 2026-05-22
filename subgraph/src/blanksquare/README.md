# Blanksquare

## Contracts

- **Shielder:** is a contract that functions as the shielded pool for all assets. It allows users to deposit and withdraw funds using zk proofs. Each depositor needs a new account for [native ETH](https://github.com/Cardinal-Cryptography/blanksquare-monorepo/blob/5dad5a07fc4ace59c9ea390fd683bdf0c27ec36e/contracts/Shielder.sol#L204) and a new account for [ERC20 tokens](https://github.com/Cardinal-Cryptography/blanksquare-monorepo/blob/5dad5a07fc4ace59c9ea390fd683bdf0c27ec36e/contracts/Shielder.sol#L260) before depositing funds.
  - Address: [0x064A67a5484DF6baf36be42F9554d45E7741dCFf](https://basescan.org/address/0x064a67a5484df6baf36be42f9554d45e7741dcff)
  - Contract: [Shielder](https://github.com/Cardinal-Cryptography/blanksquare-monorepo/blob/main/contracts/Shielder.sol)

## Deposit

1. User can deposit [native ETH](https://basescan.org/tx/0x74cfeea3defe5e0315576f0d37ce0968cb40040181f76b8d665dd006b60f6873) or [ERC20 tokens](https://basescan.org/tx/0xaef0fb253fd8699b627321a321a818fdccdfac2e99109515f63d1c02694a0c41) to the Shielder contract. Both deposit actions will emit a `Deposit` event that we can use to track the specific transactions.

## Withdraw

1. User can withdraw [native ETH](https://basescan.org/tx/0x0d0da214123842914ed2a1521b21e0772994f5c9d66492dc352eeafa2e5e6ed3) and [ERC20 tokens](https://basescan.org/tx/0x2622d53c44f702398c8ea64a29e09764f217a7728802dc2a22990395645bc61e) from the Shielder contract by providing a valid ZK proof. Both withdrawal actions will emit a `Withdraw` event that we can use to track the specific transactions.
