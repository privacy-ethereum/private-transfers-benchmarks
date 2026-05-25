import { Fluidkey } from "./fluidkey/index.js";
import { Houdiniswap } from "./houdiniswap/index.js";
import { Intmax } from "./intmax/index.js";
import { Monero } from "./monero/index.js";
import { SubgraphService } from "./subgraph/index.js";
import { db } from "./utils/db.js";

const fluidkey = new Fluidkey();
const houdiniswap = new Houdiniswap();
const intmax = new Intmax();
const monero = new Monero();

await db.read();

const start = Date.now();

const subgraphService = await SubgraphService.getInstance();
const [arbitrumRoot, mainnetRoot, sepoliaRoot] = await Promise.all([
  subgraphService.fetchArbitrumRootQueryWithCache(),
  subgraphService.fetchMainnetRootQueryWithCache(),
  subgraphService.fetchSepoliaRootQueryWithCache(),
]);

const [fluidkeyMetrics, houdiniswapMetrics, intmaxMetrics, moneroMetrics] = await Promise.all([
  fluidkey.benchmark(),
  houdiniswap.benchmark(),
  intmax.benchmark(),
  monero.benchmark(),
]);

await db.update((data) => {
  // eslint-disable-next-line no-param-reassign
  data.curvy = arbitrumRoot?.fluidkeyProtocolStats;

  // eslint-disable-next-line no-param-reassign
  data.railgun = mainnetRoot?.railgunProtocolStats;

  // eslint-disable-next-line no-param-reassign
  data.tornadoCash = mainnetRoot?.tornadoCashProtocolStats;

  // eslint-disable-next-line no-param-reassign
  data.privacyPools = mainnetRoot?.privacyPoolsProtocolStats;

  // eslint-disable-next-line no-param-reassign
  data.hinkal = mainnetRoot?.hinkalProtocolStats;

  // eslint-disable-next-line no-param-reassign
  data.fluidkey = {
    ...(mainnetRoot?.fluidkeyProtocolStats ?? {}),
    ...fluidkeyMetrics,
  };

  // eslint-disable-next-line no-param-reassign
  data.redact = sepoliaRoot?.redactProtocolStats;

  // eslint-disable-next-line no-param-reassign
  data.intmax = intmaxMetrics;

  // eslint-disable-next-line no-param-reassign
  data.monero = moneroMetrics;

  // eslint-disable-next-line no-param-reassign
  data.houdiniswap = houdiniswapMetrics;
});

const end = Date.now();

// eslint-disable-next-line no-console
console.log(`Benchmarks completed in ${(end - start) / 1000} seconds`);
