import type { FeeMetrics } from "../utils/types.js";

import {
  NATIVE_ETH_TRANSFER,
  USDC_ERC20_TRANSFER,
  USDT_ERC20_TRANSFER,
  WETH_ERC20_TRANSFER,
} from "../utils/constants.js";

export class Fluidkey {
  readonly id = "fluidkey";

  benchmark(): Record<string, FeeMetrics> {
    return {
      publicToStealthETH: {
        averageGasUsed: NATIVE_ETH_TRANSFER,
      },
      stealthToPublicETH: {
        averageGasUsed: "no-data",
      },
      publicToStealthWETH: {
        averageGasUsed: WETH_ERC20_TRANSFER.new,
      },
      stealthToPublicWETH: {
        averageGasUsed: "no-data",
      },
      publicToStealthUSDC: {
        averageGasUsed: USDC_ERC20_TRANSFER.new,
      },
      stealthToPublicUSDC: {
        averageGasUsed: "no-data",
      },
      publicToStealthUSDT: {
        averageGasUsed: USDT_ERC20_TRANSFER.new,
      },
      stealthToPublicUSDT: {
        averageGasUsed: "no-data",
      },
    };
  }
}
