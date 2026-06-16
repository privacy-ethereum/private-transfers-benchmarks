import { readFile, writeFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { buildCostValueAndNotes, fetchGasPrices, syncOperation, upsertProperty } from "./utils";
import { type IBenchmarks } from "./interfaces";
import { type Evaluation } from "../../src/types";
import {
  CAMEL_CASE_REGEX,
  DEPOSIT_PROPERTY_NAME,
  ERC_7528_NATIVE_ETH_ADDRESS,
  ETH_PRIVACY_POOLS_MAINNET,
  TRANSFER_PROPERTY_NAME,
  WETH_ADDRESS_IN_MAINNET,
  WITHDRAW_PROPERTY_NAME,
} from "./constants";
import { Network, Protocol } from "./enums";

async function syncBenchmarks() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const sourcePath = resolve(scriptDirectory, "../../../gas-benchmarks/benchmarks.json");
  const evaluationsDir = resolve(scriptDirectory, "../../src/data/evaluations");

  const [benchmarks, gasPrices] = await Promise.all([
    readFile(sourcePath, "utf-8").then((value) => JSON.parse(value) as Record<string, IBenchmarks | null>),
    fetchGasPrices(),
  ]);

  console.log(`Date: ${gasPrices.date}`);
  console.log(`ETH price: $${gasPrices.ethInUsd}`);
  Object.values(Network).forEach((network) => {
    console.log(`Gas price on ${network}: ${gasPrices.inETH[network]} gwei`);
  });

  const keys = Object.keys(benchmarks);

  await Promise.all(
    keys.map(async (camelCaseKey) => {
      const benchmark = benchmarks[camelCaseKey];

      if (!benchmark) {
        return;
      }

      const kebabKey = camelCaseKey.replace(CAMEL_CASE_REGEX, "$1-$2").toLowerCase();
      const snakeCaseKey = camelCaseKey.replace(CAMEL_CASE_REGEX, "$1_$2").toLowerCase();

      const filePath = join(evaluationsDir, `${kebabKey}.json`);
      const evaluation = await readFile(filePath, "utf-8").then((value) => JSON.parse(value) as Evaluation);
      const protocolName = Protocol[snakeCaseKey.toUpperCase() as keyof typeof Protocol];

      switch (protocolName) {
        case Protocol.BLANKSQUARE: {
          const { deposit, withdraw } = benchmark;

          const depositETH = deposit.depositStats.find((property) => property.id === "blanksquare-deposit-native-eth");
          const withdrawETH = withdraw.withdrawStats.find(
            (property) => property.id === "blanksquare-withdraw-native-eth",
          );

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, depositETH!, Network.BASE, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdrawETH!, Network.BASE, gasPrices);
          break;
        }
        case Protocol.CURVY: {
          const { publicToStealthETH, stealthToPublic } = benchmark;

          const average = Number(publicToStealthETH.averageGasUsed);
          const { value, notes } = buildCostValueAndNotes(average, gasPrices);

          upsertProperty(evaluation.properties, DEPOSIT_PROPERTY_NAME, value, notes);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, stealthToPublic, Network.ARBITRUM, gasPrices);
          break;
        }
        case Protocol.FLUIDKEY: {
          const { publicToStealthETH, stealthToPublic } = benchmark;

          const average = Number(publicToStealthETH.averageGasUsed);
          const { value, notes } = buildCostValueAndNotes(average, gasPrices);

          upsertProperty(evaluation.properties, DEPOSIT_PROPERTY_NAME, value, notes);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, stealthToPublic, Network.MAINNET, gasPrices);
          break;
        }
        case Protocol.HINKAL: {
          const { shieldNative, unshieldNative, transact } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldNative, Network.MAINNET, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshieldNative, Network.MAINNET, gasPrices);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, transact, Network.MAINNET, gasPrices);
          break;
        }
        case Protocol.HOUDINISWAP: {
          const { publicToCEXETH } = benchmark;

          const average = Number(publicToCEXETH.averageGasUsed);
          const { value, notes } = buildCostValueAndNotes(average, gasPrices);

          upsertProperty(evaluation.properties, TRANSFER_PROPERTY_NAME, value, notes);
          break;
        }
        case Protocol.INTMAX: {
          const { mainnet, scroll } = benchmark;

          const deposit = mainnet.deposit;
          const withdrawal = scroll.withdrawal;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, deposit, Network.MAINNET, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdrawal, Network.SCROLL, gasPrices);
          break;
        }
        case Protocol.MONERO: {
          const { transfer } = benchmark;

          const average = String(transfer.averageTxFee);

          upsertProperty(evaluation.properties, TRANSFER_PROPERTY_NAME, average, "");
          break;
        }
        case Protocol.PRIVACY_POOLS: {
          const { shield, unshield } = benchmark;

          const shieldETH = shield.shieldTokenStats.find(
            (property) => property.tokenAddress === ETH_PRIVACY_POOLS_MAINNET,
          );
          const unshieldETH = unshield.unshieldTokenStats.find(
            (property) => property.tokenAddress === ERC_7528_NATIVE_ETH_ADDRESS,
          );

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldETH!, Network.MAINNET, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshieldETH!, Network.MAINNET, gasPrices);
          break;
        }
        case Protocol.RAILGUN: {
          const { shield, unshield, transact } = benchmark;

          const shieldWETH = shield.shieldTokenStats.find(
            (property) => property.tokenAddress === WETH_ADDRESS_IN_MAINNET,
          );
          const unshieldWETH = unshield.unshieldTokenStats.find(
            (property) => property.tokenAddress === WETH_ADDRESS_IN_MAINNET,
          );

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldWETH!, Network.MAINNET, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshieldWETH!, Network.MAINNET, gasPrices);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, transact, Network.MAINNET, gasPrices);
          break;
        }
        case Protocol.REDACT: {
          const { shieldedNative, unshielded } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldedNative, Network.SEPOLIA, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshielded, Network.SEPOLIA, gasPrices);
          break;
        }
        case Protocol.TORNADO_CASH: {
          const { shield, unshield } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shield, Network.MAINNET, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshield, Network.MAINNET, gasPrices);
          break;
        }
        case Protocol.VEIL_CASH: {
          const { depositQueued, withdraw, transfer } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, depositQueued, Network.BASE, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdraw, Network.BASE, gasPrices);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, transfer, Network.BASE, gasPrices);
          break;
        }
        case Protocol.WORM: {
          const { publicToBurnETH, withdraw } = benchmark;

          const average = Number(publicToBurnETH.averageGasUsed);
          const { value, notes } = buildCostValueAndNotes(average, gasPrices);

          upsertProperty(evaluation.properties, DEPOSIT_PROPERTY_NAME, value, notes);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdraw, Network.MAINNET, gasPrices);
          break;
        }
        case Protocol.ZERC20: {
          const { wrap, unwrap, teleport } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, wrap, Network.MAINNET, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unwrap, Network.MAINNET, gasPrices);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, teleport, Network.MAINNET, gasPrices);
          break;
        }
        default:
          return;
      }

      await writeFile(filePath, `${JSON.stringify(evaluation, null, 2)}\n`);
    }),
  );
}

await syncBenchmarks();
