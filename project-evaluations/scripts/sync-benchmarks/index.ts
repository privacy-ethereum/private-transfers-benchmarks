import { readFile, writeFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import {
  DEPOSIT_PROPERTY_NAME,
  Protocol,
  syncOperation,
  TRANSFER_PROPERTY_NAME,
  upsertProperty,
  WETH_ADDRESS,
  WITHDRAW_PROPERTY_NAME,
} from "./utils";
import { type IBenchmarks } from "./interfaces";
import { type Evaluation } from "../../src/types";

async function syncBenchmarks() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const sourcePath = resolve(scriptDirectory, "../../../gas-benchmarks/benchmarks.json");
  const evaluationsDir = resolve(scriptDirectory, "../../src/data/evaluations");

  const benchmarks = await readFile(sourcePath, "utf-8").then(
    (value) => JSON.parse(value) as Record<string, IBenchmarks | null>,
  );
  const keys = Object.keys(benchmarks);

  await Promise.all(
    keys.map(async (key) => {
      const benchmark = benchmarks[key];

      if (!benchmark) {
        return;
      }

      const kebabKey = Protocol[key as keyof typeof Protocol];
      const filePath = join(evaluationsDir, `${kebabKey}.json`);
      const evaluation = await readFile(filePath, "utf-8").then((value) => JSON.parse(value) as Evaluation);

      switch (kebabKey) {
        case Protocol.BLANKSQUARE: {
          const { deposit, withdraw } = benchmark;
          // TODO: filter by token address

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, deposit);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdraw);
          break;
        }
        case Protocol.CURVY: {
          const { publicToStealthETH, stealthToPublic } = benchmark;

          upsertProperty(evaluation.properties, DEPOSIT_PROPERTY_NAME, Number(publicToStealthETH.averageGasUsed));
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, stealthToPublic);
          break;
        }
        case Protocol.FLUIDKEY: {
          const { publicToStealthETH, stealthToPublic } = benchmark;

          upsertProperty(evaluation.properties, DEPOSIT_PROPERTY_NAME, Number(publicToStealthETH.averageGasUsed));
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, stealthToPublic);
          break;
        }
        case Protocol.HINKAL: {
          const { shieldNative, unshieldNative } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldNative);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshieldNative);
          break;
        }
        case Protocol.HOUDINISWAP: {
          const { publicToCEXETH, CEXToPublicETH } = benchmark;

          upsertProperty(evaluation.properties, DEPOSIT_PROPERTY_NAME, Number(publicToCEXETH.averageGasUsed));
          upsertProperty(evaluation.properties, WITHDRAW_PROPERTY_NAME, Number(CEXToPublicETH.averageGasUsed));
          break;
        }
        case Protocol.INTMAX: {
          // TODO: complete this
          break;
        }
        case Protocol.MONERO: {
          const { transfer } = benchmark;

          upsertProperty(evaluation.properties, TRANSFER_PROPERTY_NAME, transfer.averageTxFee);
          break;
        }
        case Protocol.PRIVACY_POOLS: {
          const { shield, unshield } = benchmark;

          const shieldETH = shield.shieldTokenStats.find((property) => property.tokenAddress === "");
          const unshieldETH = unshield.unshieldTokenStats.find((property) => property.tokenAddress == "");

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldETH!);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshieldETH!);
          break;
        }
        case Protocol.RAILGUN: {
          const { shield, unshield, transact } = benchmark;

          const shieldWETH = shield.shieldTokenStats.find((property) => property.tokenAddress === WETH_ADDRESS);
          const unshieldWETH = unshield.unshieldTokenStats.find((property) => property.tokenAddress === WETH_ADDRESS);

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldWETH!);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshieldWETH!);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, transact);
          break;
        }
        case Protocol.REDACT: {
          const { shieldedNative, unshielded } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shieldedNative);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshielded);
          break;
        }
        case Protocol.TORNADO_CASH: {
          const { shield, unshield } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, shield);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unshield);
          break;
        }
        case Protocol.VEIL_CASH: {
          const { depositQueued, withdraw, transfer } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, depositQueued);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdraw);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, transfer);
          break;
        }
        case Protocol.WORM: {
          const { publicToBurnETH, withdraw } = benchmark;

          upsertProperty(evaluation.properties, DEPOSIT_PROPERTY_NAME, Number(publicToBurnETH.averageGasUsed));
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, withdraw);
          break;
        }
        case Protocol.ZERC20: {
          const { wrap, unwrap, teleport } = benchmark;

          syncOperation(evaluation.properties, DEPOSIT_PROPERTY_NAME, wrap);
          syncOperation(evaluation.properties, WITHDRAW_PROPERTY_NAME, unwrap);
          syncOperation(evaluation.properties, TRANSFER_PROPERTY_NAME, teleport);
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
