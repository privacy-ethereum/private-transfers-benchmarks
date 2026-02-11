import { config } from "dotenv";

config();

export const ETH_RPC_URL = String(process.env.ETH_RPC_URL);

export const BLOCK_RANGE = 1_000n;

export const NUMBER_OF_TRANSACTIONS = Number(process.env.NUMBER_OF_TRANSACTIONS);
