import { PrivacyPools } from "./privacy-pools/index.js";
import { Railgun } from "./railgun/index.js";
import { TornadoCash } from "./tornado-cash/index.js";

const railgun = new Railgun();
const tornadoCash = new TornadoCash();
const privacyPools = new PrivacyPools();

const start = Date.now();

await railgun.benchmark();
await tornadoCash.benchmark();
await privacyPools.benchmark();

const end = Date.now();

// eslint-disable-next-line no-console
console.log(`Benchmarks completed in ${(end - start) / 1000} seconds`);
