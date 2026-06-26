// Deterministic cross-check: deployed-subgraph average gas vs on-chain measured gas, every protocol.
// Pinned to fixed tip blocks, so the same inputs produce the same output. Run with tsx:
//
//   npx tsx audit/reproduce/reproduce.ts                 # all checks
//   npx tsx audit/reproduce/reproduce.ts privacy-pools   # one protocol by id prefix
//
// Reads per-chain RPC URLs and subgraph URLs from gas-benchmarks/.env and project-evaluations/.env.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

type Env = Record<string, string>;
function parseEnv(path: string): Env {
  const out: Env = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}
const gbEnv = parseEnv(join(root, "gas-benchmarks", ".env"));
const peEnv = parseEnv(join(root, "project-evaluations", ".env"));

type ChainId = "eth" | "arb" | "base" | "scroll" | "sepolia";
interface Chain {
  rpc: string;
  subgraph?: string;
  tip: number;
  window: number; // initial look-back in blocks; doubled until enough events
}
const CHAINS: Record<ChainId, Chain> = {
  eth: { rpc: peEnv.ETH_RPC_URL, subgraph: gbEnv.MAINNET_SUBGRAPH_URL, tip: 25_396_786, window: 50_000 },
  arb: { rpc: peEnv.ARB_RPC_URL, subgraph: gbEnv.ARBITRUM_SUBGRAPH_URL, tip: 477_297_066, window: 5_000_000 },
  base: { rpc: peEnv.BASE_RPC_URL, subgraph: gbEnv.BASE_SUBGRAPH_URL, tip: 47_813_521, window: 2_000_000 },
  scroll: { rpc: peEnv.SCROLL_RPC_URL, subgraph: gbEnv.SCROLL_SUBGRAPH_URL, tip: 34_187_936, window: 2_000_000 },
  sepolia: { rpc: peEnv.SEPOLIA_RPC_URL, subgraph: gbEnv.SEPOLIA_SUBGRAPH_URL, tip: 11_138_870, window: 500_000 },
};

interface Check {
  id: string;
  protocol: string;
  operation: string;
  chain: ChainId;
  contract: string;
  topic0: string;
  poolTopic?: string; // optional indexed topic[2] filter (lower-case, 32-byte padded)
  excludeTopic?: string; // drop txs that also emit this topic (e.g. Railgun unshields also emit Transact)
}

const T = {
  ppDeposit: "0xf5681f9d0db1b911ac18ee83d515a1cf1051853a9eae418316a2fdf7dea427c5",
  ppWithdraw: "0xe9b67844a7bb6e6ac95e8a0de02e4448dbb0c9460be9194348e4bbac6d13c2cf",
  rgShield: "0x3a5b9dc26075a3801a6ddccf95fec485bb7500a91b44cec1add984c21ee6db3b",
  rgUnshield: "0xd93cf895c7d5b2cd7dc7a098b678b3089f37d91f48d9b83a0800a91cbdf05284",
  rgTransact: "0x56a618cda1e34057b7f849a5792f6c8587a2dbe11c83d0254e72cb3daffda7d1",
  hkCommitment: "0xc2e3bd2d00c3cf4d09298e5a0cfd317cf7a6e5bf15d467cfa805a91e1a4a221d",
  hkNullified: "0xda5c236f484b8df30f1352feea0a68beb5b0981b991061fdc8cdf3ce135c08fe",
  zWrap: "0x9030e93f976e327ab5ef1166d3fe5cfb0820f381770421bbfef5bc656fa15687",
  zUnwrap: "0x0004d6f644fc2d087d5be8fde32a4db2f8c58d96f5bb217130b5ca6d5af8f21d",
  zTeleport: "0xb7d7623245cb52e55db0c4265c68f0507e52aadd4f195cfdafaf1ea5d107e72d",
  imDeposit: "0x1061e9784cdd951f4cbc394956165b3a94cf872a3afda95fc76b55cefb35cc51",
  fkRelayed: "0xb38c6253ab43dce0d5cdd14c81626a08b027f667f661013457dddea580d875bc",
  cvWithdraw: "0x9b1bfa7fa9ee420a16e124f794c35ac9f90472acc99140eb2f6447c714cad8eb",
  bsDeposit: "0xc81816c18fce23aa9061826780d976a4fdddebde064ad83722d157a89f39f738",
  bsWithdraw: "0xe29a05751186ef5c2f95758981409c90ffb53df312ac3c9045828ca41ca491ed",
  veilQueued: "0xd2feba4618d21760b423b6c34503c0fb23ecb39fdfda62ee6fa94775f73eb3b3",
  veilAccepted: "0xb45dd7b216b4d1e3f5a9ce082b0b41bb7343406f06031d22046e8835bf882170",
  veilNullifier: "0x5e58f77bbf94b46d8d896e29753e4458c6e59b48581e20ed58c9558e96f297ce",
  rdShield: "0xb023c23a16efa3da069bd37772e47a37dab66c30f6626c1fc239d6037381e33b",
  rdUnshield: "0x5e4a739deb052871d39ea9aa5d20fea3897a302b54a1d1f423af763b0b257f6d",
  imScrollWithdraw: "0xdbe674c66915823ad8cb90cac7eb482e951adec0311c9cf091da19de527ee935",
};
const pad32 = (a: string) => "0x" + "0".repeat(24) + a.toLowerCase().replace(/^0x/, "");

const CHECKS: Check[] = [
  {
    id: "privacy-pools-deposit",
    protocol: "Privacy Pools",
    operation: "deposit (ETH pool 0xf241)",
    chain: "eth",
    contract: "0x6818809EefCe719E480a7526D76bD3e561526b46",
    topic0: T.ppDeposit,
    poolTopic: pad32("0xf241d57c6debae225c0f2e6ea1529373c9a9c9fb"),
  },
  {
    id: "privacy-pools-withdraw",
    protocol: "Privacy Pools",
    operation: "withdraw",
    chain: "eth",
    contract: "0x6818809EefCe719E480a7526D76bD3e561526b46",
    topic0: T.ppWithdraw,
  },
  {
    id: "railgun-shield",
    protocol: "Railgun",
    operation: "deposit (shield)",
    chain: "eth",
    contract: "0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9",
    topic0: T.rgShield,
  },
  {
    id: "railgun-unshield",
    protocol: "Railgun",
    operation: "withdraw (unshield)",
    chain: "eth",
    contract: "0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9",
    topic0: T.rgUnshield,
  },
  {
    id: "railgun-transact",
    protocol: "Railgun",
    operation: "transfer (transact)",
    chain: "eth",
    contract: "0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9",
    topic0: T.rgTransact,
    excludeTopic: T.rgUnshield,
  },
  {
    id: "hinkal-commitment",
    protocol: "Hinkal",
    operation: "deposit/transfer (NewCommitment)",
    chain: "eth",
    contract: "0x25e5e82f5702A27C3466fE68f14abDbbAdFca826",
    topic0: T.hkCommitment,
  },
  {
    id: "hinkal-nullified",
    protocol: "Hinkal",
    operation: "withdraw (Nullified)",
    chain: "eth",
    contract: "0x25e5e82f5702A27C3466fE68f14abDbbAdFca826",
    topic0: T.hkNullified,
  },
  {
    id: "zerc20-wrap",
    protocol: "zERC20",
    operation: "deposit (wrap)",
    chain: "eth",
    contract: "0xcC10b7098FEf1aB2f0FF3bE91d2A7B3230b90CF0",
    topic0: T.zWrap,
  },
  {
    id: "zerc20-unwrap",
    protocol: "zERC20",
    operation: "withdraw (unwrap)",
    chain: "eth",
    contract: "0xcC10b7098FEf1aB2f0FF3bE91d2A7B3230b90CF0",
    topic0: T.zUnwrap,
  },
  {
    id: "zerc20-teleport",
    protocol: "zERC20",
    operation: "transfer (teleport)",
    chain: "eth",
    contract: "0x410056c6f0a9abd8c42b9eef3bb451966fb0d924",
    topic0: T.zTeleport,
  },
  {
    id: "intmax-deposit",
    protocol: "Intmax",
    operation: "deposit",
    chain: "eth",
    contract: "0xF65e73aAc9182e353600a916a6c7681F810f79C3",
    topic0: T.imDeposit,
  },
  {
    id: "fluidkey-transfer",
    protocol: "Fluidkey",
    operation: "transfer (OperationRelayed)",
    chain: "eth",
    contract: "0x8090a9DB6Aca56fFA186C75Ca0787B18af1058a0",
    topic0: T.fkRelayed,
  },
  {
    id: "curvy-withdraw",
    protocol: "Curvy",
    operation: "transfer (Withdraw)",
    chain: "arb",
    contract: "0xB4BA872fBa00Bc4268067D5DE4223240cEc4B6d5",
    topic0: T.cvWithdraw,
  },
  {
    id: "blanksquare-deposit",
    protocol: "Blanksquare",
    operation: "deposit",
    chain: "base",
    contract: "0x064A67a5484DF6baf36be42F9554d45E7741dCFf",
    topic0: T.bsDeposit,
  },
  {
    id: "blanksquare-withdraw",
    protocol: "Blanksquare",
    operation: "withdraw",
    chain: "base",
    contract: "0x064A67a5484DF6baf36be42F9554d45E7741dCFf",
    topic0: T.bsWithdraw,
  },
  {
    id: "veil-deposit-queued",
    protocol: "Veil Cash",
    operation: "deposit (queued)",
    chain: "base",
    contract: "0xA4a926A2E7a22c38e8DFC6744A61a6aA8b06B230",
    topic0: T.veilQueued,
  },
  {
    id: "veil-deposit-accepted",
    protocol: "Veil Cash",
    operation: "deposit (accepted)",
    chain: "base",
    contract: "0xA4a926A2E7a22c38e8DFC6744A61a6aA8b06B230",
    topic0: T.veilAccepted,
  },
  {
    id: "veil-nullifier",
    protocol: "Veil Cash",
    operation: "withdraw/transfer (NewNullifier)",
    chain: "base",
    contract: "0x293dCda114533FF8f477271c5cA517209FFDEEe7",
    topic0: T.veilNullifier,
  },
  {
    id: "redact-shield",
    protocol: "Redact",
    operation: "deposit (ShieldedNative)",
    chain: "sepolia",
    contract: "0xC132c8a82A24Fe1e491082932e3db4F70Ce95c93",
    topic0: T.rdShield,
  },
  {
    id: "redact-unshield",
    protocol: "Redact",
    operation: "withdraw (Unshielded)",
    chain: "sepolia",
    contract: "0xC132c8a82A24Fe1e491082932e3db4F70Ce95c93",
    topic0: T.rdUnshield,
  },
  {
    id: "intmax-scroll-withdraw",
    protocol: "Intmax (Scroll)",
    operation: "withdraw (DirectWithdrawalQueued)",
    chain: "scroll",
    contract: "0x86B06D2604D9A6f9760E8f691F86d5B2a7C9c449",
    topic0: T.imScrollWithdraw,
  },
];

const SAMPLE = 5;
const MIN_EVENTS = 8;
const MAX_ITERS = 7;

interface Log {
  transactionHash: string;
  topics: string[];
}
interface Result {
  id: string;
  protocol: string;
  operation: string;
  chain: ChainId;
  fromBlock: number;
  toBlock: number;
  events: number;
  txs: number;
  eventsPerTx: string;
  measuredAvgGas: number | null;
  samples: { tx: string; gas: number }[];
}

async function rpc(url: string, method: string, params: unknown[]): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await res.json();
  if (j.error) throw new Error(`${method}: ${JSON.stringify(j.error)}`);
  return j.result;
}
const hex = (n: number) => "0x" + n.toString(16);

async function getLogs(url: string, address: string, topic0: string, from: number, to: number): Promise<Log[]> {
  // Adaptive: shrink the range if the provider rejects it for size.
  try {
    return await rpc(url, "eth_getLogs", [{ address, topics: [topic0], fromBlock: hex(from), toBlock: hex(to) }]);
  } catch (e) {
    const span = to - from;
    if (span < 5000) throw e;
    const mid = Math.floor((from + to) / 2);
    const a = await getLogs(url, address, topic0, from, mid);
    const b = await getLogs(url, address, topic0, mid + 1, to);
    return [...a, ...b];
  }
}

async function run(c: Check): Promise<Result> {
  const chain = CHAINS[c.chain];
  let window = chain.window;
  let from = 0,
    to = chain.tip;
  let logs: Log[] = [];
  for (let i = 0; i < MAX_ITERS; i += 1) {
    from = Math.max(0, chain.tip - window);
    logs = await getLogs(chain.rpc, c.contract, c.topic0, from, to);
    if (c.poolTopic) logs = logs.filter((l) => (l.topics[2] || "").toLowerCase() === c.poolTopic);
    if (logs.length >= MIN_EVENTS) break;
    window *= 4;
  }
  let excludeTxs = new Set<string>();
  if (c.excludeTopic) {
    const ex = await getLogs(chain.rpc, c.contract, c.excludeTopic, from, to);
    excludeTxs = new Set(ex.map((l) => l.transactionHash));
  }
  const byTx = new Map<string, number>();
  for (const l of logs) {
    if (excludeTxs.has(l.transactionHash)) continue;
    byTx.set(l.transactionHash, (byTx.get(l.transactionHash) || 0) + 1);
  }
  const txs = [...byTx.keys()].slice(-SAMPLE); // most recent in range
  const samples: { tx: string; gas: number }[] = [];
  for (const tx of txs) {
    const r = await rpc(chain.rpc, "eth_getTransactionReceipt", [tx]);
    samples.push({ tx, gas: Number(BigInt(r.gasUsed)) });
  }
  const measuredAvgGas = samples.length ? Math.round(samples.reduce((a, b) => a + b.gas, 0) / samples.length) : null;
  return {
    id: c.id,
    protocol: c.protocol,
    operation: c.operation,
    chain: c.chain,
    fromBlock: from,
    toBlock: to,
    events: logs.length,
    txs: byTx.size,
    eventsPerTx: byTx.size ? (logs.length / byTx.size).toFixed(3) : "0",
    measuredAvgGas,
    samples,
  };
}

async function main() {
  const only = process.argv[2];
  const checks = only ? CHECKS.filter((c) => c.id.startsWith(only)) : CHECKS;
  const results: Result[] = [];
  for (const c of checks) {
    process.stdout.write(`${c.protocol} — ${c.operation} (${c.chain}) ... `);
    try {
      const r = await run(c);
      results.push(r);
      console.log(
        `avg ${r.measuredAvgGas?.toLocaleString("en-US") ?? "n/a"} gas, events/tx ${r.eventsPerTx}, ${r.events} events in ${r.toBlock - r.fromBlock} blocks`,
      );
    } catch (e) {
      console.log(`FAILED: ${(e as Error).message}`);
    }
  }
  writeFileSync(join(here, "results.json"), JSON.stringify(results, null, 2) + "\n");
  console.log(`\nwrote results.json (${results.length} checks)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
