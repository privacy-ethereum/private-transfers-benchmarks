# Gas units for ERC20 tokens

There are some protocols that do not have any contract interaction in their "deposit" step. These are usually stealth-address-based protocols that ask users to transfer funds to specific newly fresh addresses that will later be usable by deploying a smart contract account in the "withdraw" step.

This means that "deposit" transactions will be normal native ETH or ERC20 token transfers. In order to avoid indexing all historical ERC20 token transfer events in our subgraph, we have decided to use a fixed gas unit cost for the popular ERC20 tokens that are supported in the protocols we benchmark.

## Supported ERC20 tokens

| Protocol    | Tokens supported                                                                                                           | Source                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Fluidkey    | USDC, ZCHF, EURC, xAUT, cbBTC, ETH, DAI, WBTC, WETH, USDT, WXDAI, GNO, USDC.e, WOPOL, GHO, user can import any other token | [source](https://docs.fluidkey.com/readme/receiving-funds/)      |
| Curvy       | WETH, USDT, UNI, WBTC, ETH, USDC                                                                                           | [source](https://docs.curvy.box/assets/public-page.CfBAuusO.png) |
| Houdiniswap | ETH, USDT, USDC, USDS, LINK, DAI, PYUSD, XAUt, PAXG, SKY, PEPE, NEXO, EURC, ASTEROID, TORN, WOLF, LOCK, WBTC, stETH, SXT   | [source](https://app.houdiniswap.com/)                           |
| WORM        | ETH                                                                                                                        | [source](https://worm.cx/wormhole)                               |

## Gas units calculation

### EVM Building Blocks

Every ERC20 transfer() does the same logical operations. The gas cost is the sum of the opcodes executed:

| Component                               | Gas           | Score               |
| --------------------------------------- | ------------- | ------------------- |
| Base transaction                        | 21,000        | Yellow Paper        |
| Non-zero calldata bytes                 | 16 gas/byte   | EIP-2028            |
| Zero calldata bytes                     | 4 gas/byte    | EIP-2028            |
| Cold SLOAD (first access to a slot)     | 2,100         | EIP-2029            |
| Warm SLOAD (slot already accessed)      | 100           | EIP-2029            |
| SSTORE nonzero → nonzero (warm)         | 2,900         | EIP-2029 + EIP-3529 |
| SSTORE zero → nonzero (warm)            | 20,000        | Yellow Paper        |
| LOG2 (Transfer event, ~3 topics + data) | 1,500 + 256\* | Yellow Paper        |
| Misc opcodes (ADD, MUL, MSTORE, etc.)   | ~200–800      | Yellow Paper        |

### WETH

Contract source: https://github.com/gnosis/canonical-weth/blob/0dd1ea3e295eef916d0c6223ec63141137d22d67/contracts/WETH9.sol#L55

```javascript
function transfer(address dst, uint wad) public returns (bool) {
    return transferFrom(msg.sender, dst, wad);
}

function transferFrom(address src, address dst, uint wad) public returns (bool) {
    // ...
    balanceOf[src] -= wad;        // SLOAD (cold) + SSTORE nonzero→nonzero
    balanceOf[dst] += wad;        // SLOAD (cold or warm) + SSTORE
    emit Transfer(src, dst, wad); // LOG3
    return true;
}
```

| Component                       | Existing recipient | New recipient |
| ------------------------------- | ------------------ | ------------- |
| Base tx                         | 21,000             | 21,000        |
| Calldata (~68 bytes)            | 608                | 608           |
| Cold SLOAD sender balance       | 2,100              | 2,100         |
| SSTORE sender (nonzero→nonzero) | 2,900              | 2,900         |
| Cold SLOAD recipient balance    | 2,100              | 2,100         |
| SSTORE recipient                | 2,900              | 20,000        |
| LOG3 Transfer event             | 1,756              | 1,756         |
| Misc opcodes                    | ~400               | ~400          |
| Total                           | ~33,764            | ~50,864       |

### USDT

Contract source: https://github.com/tethercoin/USDT/blob/c3e3caa95c30e74a0f4f0d616e13ff97daa02191/TetherToken.sol#L350

```javascript
function transferFrom(address _from, address _to, uint _value) public whenNotPaused {
    require(!isBlackListed[_from]);
    if (deprecated) {
        return UpgradedStandardToken(upgradedAddress).transferFromByLegacy(msg.sender, _from, _to, _value);
    } else {
        return super.transferFrom(_from, _to, _value);
    }
}
```

| Component                       | Existing recipient | New recipient |
| ------------------------------- | ------------------ | ------------- |
| Base tx                         | 21,000             | 21,000        |
| Calldata                        | 608                | 608           |
| Blacklist SLOAD sender          | 2,100              | 2,100         |
| Cold SLOAD sender balance       | 2,100              | 2,100         |
| SSTORE sender (nonzero→nonzero) | 2,900              | 2,900         |
| Cold SLOAD recipient balance    | 2,100              | 2,100         |
| SSTORE recipient                | 2,900              | 20,000        |
| LOG3 Transfer event             | 1,756              | 1,756         |
| Misc opcodes                    | ~500               | ~500          |
| Total                           | ~35,964            | ~53,064       |

### USDC

The [deployed ERC20 token](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48) uses a proxy contract. The proxy pattern increases gas units used.

Contract source: https://github.com/circlefin/stablecoin-evm/blob/46e61d0050520f4227cc02ae0d55e8aee3d43fb6/contracts/v1/FiatTokenV1.sol#L287

```javascript
function transfer(address to, uint256 value)
    external
    virtual
    override
    whenNotPaused
    notBlacklisted(msg.sender)
    notBlacklisted(to)
    returns (bool)
{
    _transfer(msg.sender, to, value);  // SLOAD×2 + SSTORE×2 + LOG3
    return true;
}
```

| Component                         | Existing recipient | New recipient |
| --------------------------------- | ------------------ | ------------- |
| Base tx                           | 21,000             | 21,000        |
| Calldata                          | 608                | 608           |
| Cold CALL into proxy              | 2,600              | 2,600         |
| SLOAD implementation slot (proxy) | 2,100              | 2,100         |
| paused SLOAD                      | 2,100              | 2,100         |
| Blacklist SLOAD sender            | 2,100              | 2,100         |
| Blacklist SLOAD recipient         | 2,100              | 2,100         |
| Cold SLOAD sender balance         | 2,100              | 2,100         |
| SSTORE sender (nonzero→nonzero)   | 2,900              | 2,900         |
| Cold SLOAD recipient balance      | 2,100              | 2,100         |
| SSTORE recipient                  | 2,900              | 20,000        |
| LOG3 Transfer event               | 1,756              | 1,756         |
| Misc opcodes                      | ~600               | ~600          |
| Total                             | ~44,964            | ~62,064       |
