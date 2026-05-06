# ZERC20

## Contracts

## Wrap

## Private Transfer

1. Sender [sends a zERC20 transfer](https://etherscan.io/tx/0xdbde649394d7fbbca61f9d9cece2296fbc7be51b3edb296c5c2f6272d86f0216) to a burn address. To the public observers it looks like a normal address holding zERC20 tokens.

2. Receiver needs to [claim the funds](https://etherscan.io/tx/0x74ecea93bd7f47592676837088f4b374cbff0cba2fb015fa8428e90f6845f43e) using a gasless relayer. The receiver will click on the UI and a transaction from the relayer will be sent to move the zERC20 tokens to the receiver's address.
