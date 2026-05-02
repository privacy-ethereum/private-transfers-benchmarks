import type { FeeMetrics } from "../utils/types.js";

import { subgraph } from "../subgraph/index.js";
import {
  NATIVE_ETH_TRANSFER,
  USDC_ERC20_TRANSFER,
  USDT_ERC20_TRANSFER,
  WETH_ERC20_TRANSFER,
} from "../utils/constants.js";

export class Fluidkey {
  readonly id = "fluidkey";

  async benchmark(): Promise<Record<string, FeeMetrics>> {
    const results = await subgraph.getResults();
    const { fluidkeyProtocolStats } = results;

    const stealthToPublic = fluidkeyProtocolStats?.stealthToPublic;
    const totalGasUsed = stealthToPublic ? BigInt(stealthToPublic.totalGasUsed as string) : null;
    const totalCount = stealthToPublic ? BigInt(stealthToPublic.totalCount as string) : null;

    const isThereData = totalGasUsed !== null && totalCount !== null && totalCount > 0;

    const gasUsedAverage = isThereData ? totalGasUsed / totalCount : "no-data";

    return {
      publicToStealthETH: {
        averageGasUsed: NATIVE_ETH_TRANSFER,
      },
      stealthToPublicETH: {
        averageGasUsed: gasUsedAverage,
      },
      publicToStealthWETH: {
        averageGasUsed: WETH_ERC20_TRANSFER.new,
      },
      stealthToPublicWETH: {
        averageGasUsed: gasUsedAverage,
      },
      publicToStealthUSDC: {
        averageGasUsed: USDC_ERC20_TRANSFER.new,
      },
      stealthToPublicUSDC: {
        averageGasUsed: gasUsedAverage,
      },
      publicToStealthUSDT: {
        averageGasUsed: USDT_ERC20_TRANSFER.new,
      },
      stealthToPublicUSDT: {
        averageGasUsed: gasUsedAverage,
      },
    };
  }
}
