import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";

import { getBaseFeePerGasAverageInDaysWindow } from "../utils/rpc.js";

describe("getBaseFeePerGasAverageInDaysWindow", () => {
  it("should calculate the average base fee per gas over a 7 days", async () => {
    const averageBaseFee = await getBaseFeePerGasAverageInDaysWindow({
      chain: mainnet,
      windowDays: 7,
    });

    expect(averageBaseFee).toBeGreaterThan(0n);
  }, 30_000);
});
