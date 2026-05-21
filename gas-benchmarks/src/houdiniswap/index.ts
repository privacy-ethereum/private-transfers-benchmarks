import type { IBenchmarkDb } from "../utils/db.js";

import {
  NATIVE_ETH_TRANSFER,
  USDC_ERC20_TRANSFER,
  USDT_ERC20_TRANSFER,
  WETH_ERC20_TRANSFER,
} from "../utils/constants.js";

export class Houdiniswap {
  readonly id = "houdiniswap";

  benchmark(): Promise<IBenchmarkDb["houdiniswap"]> {
    return Promise.resolve({
      publicToCEXETH: {
        averageGasUsed: NATIVE_ETH_TRANSFER,
      },
      CEXToPublicETH: {
        averageGasUsed: NATIVE_ETH_TRANSFER,
      },
      publicToCEXWETH: {
        averageGasUsed: WETH_ERC20_TRANSFER.new,
      },
      CEXToPublicWETH: {
        averageGasUsed: WETH_ERC20_TRANSFER.existing,
      },
      publicToCEXUSDC: {
        averageGasUsed: USDC_ERC20_TRANSFER.new,
      },
      CEXToPublicUSDC: {
        averageGasUsed: USDC_ERC20_TRANSFER.existing,
      },
      publicToCEXUSDT: {
        averageGasUsed: USDT_ERC20_TRANSFER.new,
      },
      CEXToPublicUSDT: {
        averageGasUsed: USDT_ERC20_TRANSFER.existing,
      },
    });
  }
}
