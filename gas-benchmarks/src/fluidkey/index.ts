import type { FeeMetrics } from "../utils/types.js";

import {
  NATIVE_ETH_TRANSFER,
  USDC_ERC20_TRANSFER,
  USDT_ERC20_TRANSFER,
  WETH_ERC20_TRANSFER,
} from "../utils/constants.js";

export class Fluidkey {
  benchmark(): Promise<{
    publicToStealthETH: FeeMetrics;
    publicToStealthWETH: FeeMetrics;
    publicToStealthUSDC: FeeMetrics;
    publicToStealthUSDT: FeeMetrics;
  }> {
    return Promise.resolve({
      publicToStealthETH: {
        averageGasUsed: NATIVE_ETH_TRANSFER,
      },
      publicToStealthWETH: {
        averageGasUsed: WETH_ERC20_TRANSFER.new,
      },
      publicToStealthUSDC: {
        averageGasUsed: USDC_ERC20_TRANSFER.new,
      },
      publicToStealthUSDT: {
        averageGasUsed: USDT_ERC20_TRANSFER.new,
      },
    });
  }
}
