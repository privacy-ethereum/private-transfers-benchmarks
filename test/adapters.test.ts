import { expect } from "chai";
import { ethers } from "hardhat";
import { RailgunAdapter } from "../src/adapters";
import { BenchmarkConfig } from "../src/interfaces/IProtocolAdapter";
import { parseEther, ZeroAddress } from "ethers";

describe("Protocol Adapters", function () {
  // Increase default timeout for proof generation
  this.timeout(120000);

  let benchmarkConfig: BenchmarkConfig;

  before(async function () {
    benchmarkConfig = {
      amount: parseEther("0.1"),
      tokenAddress: ZeroAddress,
      iterations: 1,
      waitForFinality: true,
      confirmations: 1,
    };
  });

  describe("Railgun Adapter", function () {
    let adapter: RailgunAdapter;

    beforeEach(async function () {
      adapter = new RailgunAdapter();

      await adapter.initialize(ethers.provider, benchmarkConfig);
    });

    afterEach(async function () {
      await adapter.cleanup();
    });

    it("should check availability", async function () {
      const available = await adapter.isAvailable();

      expect(available).to.be.a("boolean");
    });

    it("should run setup", async function () {
      await adapter.setup();
    });
  });
});
