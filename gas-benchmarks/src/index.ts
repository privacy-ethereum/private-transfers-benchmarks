import { Curvy } from "./curvy.index.js";
import { Fluidkey } from "./fluidkey/index.js";
import { Houdiniswap } from "./houdiniswap/index.js";
import { Monero } from "./monero/index.js";
import { SubgraphService } from "./subgraph/index.js";
import { db } from "./utils/db.js";
import { Worm } from "./worm/index.js";

const curvy = new Curvy();
const fluidkey = new Fluidkey();
const houdiniswap = new Houdiniswap();
const monero = new Monero();
const worm = new Worm();

await db.read();

const start = Date.now();

const subgraphService = await SubgraphService.getInstance();
const [arbitrumRoot, baseRoot, mainnetRoot, scrollRoot, sepoliaRoot] = await Promise.all([
  subgraphService.fetchArbitrumRootQueryWithCache(),
  subgraphService.fetchBaseRootQueryWithCache(),
  subgraphService.fetchMainnetRootQueryWithCache(),
  subgraphService.fetchScrollRootQueryWithCache(),
  subgraphService.fetchSepoliaRootQueryWithCache(),
]);

const [curvyMetrics, fluidkeyMetrics, houdiniswapMetrics, moneroMetrics, wormMetrics] = await Promise.all([
  curvy.benchmark(),
  fluidkey.benchmark(),
  houdiniswap.benchmark(),
  monero.benchmark(),
  worm.benchmark(),
]);

await db.update((data) => {
  // eslint-disable-next-line no-param-reassign
  data.blanksquare = baseRoot?.blanksquareProtocolStats;

  // eslint-disable-next-line no-param-reassign
  data.curvy = {
    ...(arbitrumRoot?.curvyProtocolStats ?? {}),
    ...curvyMetrics,
  };

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
  data.intmax = {
    mainnet: mainnetRoot?.intmaxMainnetProtocolStats,
    scroll: scrollRoot?.intmaxScrollProtocolStats,
  };

  // eslint-disable-next-line no-param-reassign
  data.monero = moneroMetrics;

  // eslint-disable-next-line no-param-reassign
  data.houdiniswap = houdiniswapMetrics;

  // TODO: return back when subgraph deployment is fixed
  // eslint-disable-next-line no-param-reassign
  data.veilCash = null;

  // eslint-disable-next-line no-param-reassign
  data.worm = {
    ...(mainnetRoot?.wormProtocolStats ?? {}),
    ...wormMetrics,
  };

  // eslint-disable-next-line no-param-reassign
  data.zerc20 = mainnetRoot?.zerc20ProtocolStats;
});

const end = Date.now();

// eslint-disable-next-line no-console
console.log(`Benchmarks completed in ${(end - start) / 1000} seconds`);
