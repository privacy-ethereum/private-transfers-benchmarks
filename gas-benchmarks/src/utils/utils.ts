import { BLOCK_RANGE } from "./constants.js";

export const getBlockInRange = (block: bigint): bigint => (block > BLOCK_RANGE ? block - BLOCK_RANGE + 1n : 0n);
