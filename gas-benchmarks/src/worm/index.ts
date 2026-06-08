import type { FeeMetrics } from "../utils/types.js";

import { NATIVE_ETH_TRANSFER } from "../utils/constants.js";

export class Worm {
  benchmark(): Promise<{
    publicToBurnETH: FeeMetrics;
  }> {
    return Promise.resolve({
      publicToBurnETH: {
        averageGasUsed: NATIVE_ETH_TRANSFER,
      },
    });
  }
}
