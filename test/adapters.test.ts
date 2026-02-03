import { expect } from "chai";
import { ethers } from "hardhat";
import { RailgunAdapter, TornadoCashAdapter, PrivacyPoolsAdapter } from "../src/adapters";
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

    // Uncomment when actual implementation is ready
    // it("should benchmark shield operation", async function () {
    //   await adapter.setup();
    //   const result = await adapter.benchmarkShield();
    //   expect(result.scenario).to.equal(BenchmarkScenario.SHIELD);
    //   expect(result.protocol).to.equal("Railgun");
    //   expect(result.gas.gasUsed).to.be.greaterThan(BigInt(0));
    // });
  });

  describe("Tornado Cash Adapter", function () {
    let adapter: TornadoCashAdapter;

    beforeEach(async function () {
      adapter = new TornadoCashAdapter();

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

  describe("Privacy Pools Adapter", function () {
    let adapter: PrivacyPoolsAdapter;

    beforeEach(async function () {
      adapter = new PrivacyPoolsAdapter();

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
