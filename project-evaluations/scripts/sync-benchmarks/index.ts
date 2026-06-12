import { readFile, writeFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import {
  buildCostValueAndNotes,
  CAMEL_CASE_REGEX,
  DEPOSIT_PROPERTY_NAME,
  ERC_7528_NATIVE_ETH_ADDRESS,
  ETH_PRIVACY_POOLS_ADDRESS,
  fetchGasPrices,
  Protocol,
  syncOperation,
  TRANSFER_PROPERTY_NAME,
  upsertProperty,
  WETH_ADDRESS_IN_MAINNET,
  WITHDRAW_PROPERTY_NAME,
} from "./utils";
import { type IBenchmarks } from "./interfaces";
import { type Evaluation } from "../../src/types";

async function syncBenchmarks() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const sourcePath = resolve(scriptDirectory, "../../../gas-benchmarks/benchmarks.json");
  const evaluationsDir = resolve(scriptDirectory, "../../src/data/evaluations");

  const [benchmarks, gasPrices] = await Promise.all([
    readFile(sourcePath, "utf-8").then((value) => JSON.parse(value) as Record<string, IBenchmarks | null>),
    fetchGasPrices(),
  ]);

  console.log(`Gas prices: ETH=$${gasPrices.ethInUsd}, gas=${gasPrices.gasPriceInETH} gwei (${gasPrices.date})`);

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

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, depositETH!, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdrawETH!, gasPrices);
          break;
        }
        case Protocol.CURVY: {
          const { publicToStealthETH, stealthToPublic } = benchmark;

          const average = Number(publicToStealthETH.averageGasUsed);
          const { value, notes } = buildCostValueAndNotes(average, gasPrices);

          upsertProperty(evaluation.properties, DEPOSIT_PROPERTY_NAME, value, notes);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, stealthToPublic, gasPrices);
          break;
        }
        case Protocol.FLUIDKEY: {
          const { publicToStealthETH, stealthToPublic } = benchmark;

          const average = Number(publicToStealthETH.averageGasUsed);
          const { value, notes } = buildCostValueAndNotes(average, gasPrices);

          upsertProperty(evaluation.properties, DEPOSIT_PROPERTY_NAME, value, notes);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, stealthToPublic, gasPrices);
          break;
        }
        case Protocol.HINKAL: {
          const { shieldNative, unshieldNative, transact } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldNative, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshieldNative, gasPrices);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, transact, gasPrices);
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

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, deposit, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdrawal, gasPrices);
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
            (property) => property.tokenAddress === ETH_PRIVACY_POOLS_ADDRESS,
          );
          const unshieldETH = unshield.unshieldTokenStats.find(
            (property) => property.tokenAddress === ERC_7528_NATIVE_ETH_ADDRESS,
          );

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldETH!, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshieldETH!, gasPrices);
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

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldWETH!, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshieldWETH!, gasPrices);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, transact, gasPrices);
          break;
        }
        case Protocol.REDACT: {
          const { shieldedNative, unshielded } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldedNative, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshielded, gasPrices);
          break;
        }
        case Protocol.TORNADO_CASH: {
          const { shield, unshield } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shield, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshield, gasPrices);
          break;
        }
        case Protocol.VEIL_CASH: {
          const { depositQueued, withdraw, transfer } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, depositQueued, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdraw, gasPrices);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, transfer, gasPrices);
          break;
        }
        case Protocol.WORM: {
          const { publicToBurnETH, withdraw } = benchmark;

          const average = Number(publicToBurnETH.averageGasUsed);
          const { value, notes } = buildCostValueAndNotes(average, gasPrices);

          upsertProperty(evaluation.properties, DEPOSIT_PROPERTY_NAME, value, notes);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdraw, gasPrices);
          break;
        }
        case Protocol.ZERC20: {
          const { wrap, unwrap, teleport } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, wrap, gasPrices);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unwrap, gasPrices);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, teleport, gasPrices);
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
