# Houdiniswap

## Overview

Houdiniswap default private transfer is called "Private Swap". This method does not involve smart contracts, instead it uses fresh new addresses (Externally Owned Accounts - EOAs) as the receivers to "deposit" into the private protocol that later transfer the funds to CEX EOA addresses. After the deposit, the CEX hops the funds to the final recipient, this process takes a specific amount of time depending on the CEX, transfer amount, time of the transaction, etc.

There are other private methods in the Houdiniswap UI. For example there is a "Onchain DEX or Bridge" method that uses decentralized exchanges and bridges to transfer funds. Outside observers will have difficulty trying to find the final recipient but at some point they should be able to connect the dots. This method is totally non-custodial due to the use of DEXs and bridges smart contracts but it is not the default private method in Houdiniswap.

## Deposit (public to CEX)

1. Sender sends a [normal transfer (native ETH or ERC20 token transfer)](https://etherscan.io/tx/0x088ffabfd518bda6eea094735958fe8de7c0a079447caddd6efaeca4315892b5) to a [fresh new address](https://etherscan.io/address/0xEc4f46655E497DdD1d3DB92c5C524b0EcDf93b79). It is not clear who controls this wallet but the funds are no longer in the sender possession.

2. The funds are [sent from the fresh new address to a CEX deposit address](https://etherscan.io/tx/0xcb051346bda3cc7d449e479f4d067e917c698ce6d1221cc9454b433b86d82dbe) (in this particular case to a Binance deposit address).

## Withdraw (CEX to public)

1. Receiver gets the funds from a [CEX withdrawal transaction](https://etherscan.io/tx/0x1856207f7619d2b49d965831bfcc2b89745693fa595a4783f75cf038f5fe3258). This transaction is also a normal transfer (native ETH or ERC20 token transfer) but coming from a public CEX address. It is not the same CEX address as the deposit address (in this particular case the withdrawal is from a ChangeNOW address)
