import { Fluidkey } from "./fluidkey/index.js";
import { Hinkal } from "./hinkal/index.js";
import { Intmax } from "./intmax/index.js";
import { Monero } from "./monero/index.js";
import { PrivacyPools } from "./privacy-pools/index.js";
import { Railgun } from "./railgun/index.js";
import { TornadoCash } from "./tornado-cash/index.js";
import { db } from "./utils/db.js";

const railgun = new Railgun();
const tornadoCash = new TornadoCash();
const privacyPools = new PrivacyPools();
const intmax = new Intmax();
const monero = new Monero();
const hinkal = new Hinkal();
const fluidkey = new Fluidkey();

await db.read();

const start = Date.now();

const [
  railgunMetrics,
  tornadoCashMetrics,
  privacyPoolsMetrics,
  intmaxMetrics,
  moneroMetrics,
  hinkalMetrics,
  fluidkeyMetrics,
] = await Promise.all([
  railgun.benchmark(),
  tornadoCash.benchmark(),
  privacyPools.benchmark(),
  intmax.benchmark(),
  monero.benchmark(),
  hinkal.benchmark(),
  fluidkey.benchmark(),
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

  // eslint-disable-next-line no-param-reassign
  data[`${monero.name}_${monero.version}`] = {
    transfer: moneroMetrics.transfer,
  };

  // eslint-disable-next-line no-param-reassign
  data[`${hinkal.name}_${hinkal.version}`] = {
    shield_eth: hinkalMetrics.shieldEth,
    unshield_eth: hinkalMetrics.unshieldEth,
    internal_transfer: hinkalMetrics.internalTransfer,
    shield_erc20: hinkalMetrics.shieldErc20,
    unshield_erc20: hinkalMetrics.unshieldErc20,
    transfer_erc20: hinkalMetrics.internalTransfer,
  };

  // eslint-disable-next-line no-param-reassign
  data[`${fluidkey.name}_${fluidkey.version}`] = {
    shield_eth: fluidkeyMetrics.shieldEth,
    shield_erc20: fluidkeyMetrics.shieldErc20,
    transfer_eth: fluidkeyMetrics.transferEth,
    transfer_erc20: fluidkeyMetrics.transferErc20,
  };
});

const end = Date.now();

// eslint-disable-next-line no-console
console.log(`Benchmarks completed in ${(end - start) / 1000} seconds`);
