import { Intmax } from "./intmax/index.js";
import { PrivacyPools } from "./privacy-pools/index.js";
import { Railgun } from "./railgun/index.js";
import { TornadoCash } from "./tornado-cash/index.js";
import { db } from "./utils/db.js";

const railgun = new Railgun();
const tornadoCash = new TornadoCash();
const privacyPools = new PrivacyPools();
const intmax = new Intmax();

await db.read();

const start = Date.now();

const [railgunMetrics, tornadoCashMetrics, privacyPoolsMetrics, intmaxMetrics] = await Promise.all([
  railgun.benchmark(),
  tornadoCash.benchmark(),
  privacyPools.benchmark(),
  intmax.benchmark(),
]);

await db.update((data) => {
  // eslint-disable-next-line no-param-reassign
  data[`${railgun.name}_${railgun.version}`] = {
    shield_erc20: railgunMetrics.shieldErc20,
    unshield_erc20: railgunMetrics.unshieldErc20,
    transfer_erc20: railgunMetrics.transferErc20,
  };

  // eslint-disable-next-line no-param-reassign
  data[`${tornadoCash.name}_${tornadoCash.version}`] = {
    shield_eth: tornadoCashMetrics.shieldEth,
    unshield_eth: tornadoCashMetrics.unshieldEth,
  };

  // eslint-disable-next-line no-param-reassign
  data[`${privacyPools.name}_${privacyPools.version}`] = {
    shield_eth: privacyPoolsMetrics.shieldEth,
    unshield_eth: privacyPoolsMetrics.unshieldEth,
  };

  // eslint-disable-next-line no-param-reassign
  data[`${intmax.name}_${intmax.version}`] = {
    deposit_eth: intmaxMetrics.depositEth,
    withdraw_eth: intmaxMetrics.withdrawEth,
  };
});

const end = Date.now();

// eslint-disable-next-line no-console
console.log(`Benchmarks completed in ${(end - start) / 1000} seconds`);
