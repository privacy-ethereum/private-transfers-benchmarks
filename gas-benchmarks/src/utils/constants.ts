import { config } from "dotenv";

config();

export const ETH_RPC_URL = String(process.env.ETH_RPC_URL);

export const BLOCK_RANGE = 1_000n;

export const MAX_NUMBER_OF_RPC_TRIES = 10;

export const NUMBER_OF_TRANSACTIONS = Number(process.env.NUMBER_OF_TRANSACTIONS);

export const BENCHMARKS_OUTPUT_PATH = "./benchmarks.json";
