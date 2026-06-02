import { type Property } from "../../src/types";
import { type IOperationStats } from "./interfaces";

export const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

export const DEPOSIT_PROPERTY_NAME = "On-chain gas cost: deposit";
export const TRANSFER_PROPERTY_NAME = "On-chain gas cost: transfer";
export const WITHDRAW_PROPERTY_NAME = "On-chain gas cost: withdraw";

export enum Protocol {
  BLANKSQUARE = "blanksquare",
  CURVY = "curvy",
  FLUIDKEY = "fluidkey",
  HINKAL = "hinkal",
  HOUDINISWAP = "houdiniswap",
  INTMAX = "intmax",
  MONERO = "monero",
  PRIVACY_POOLS = "privacy-pools",
  RAILGUN = "railgun",
  REDACT = "redact",
  TORNADO_CASH = "tornado-cash",
  VEIL_CASH = "veil-cash",
  WORM = "worm",
  ZERC20 = "zerc20",
}

export function upsertProperty(properties: Property[], name: string, value: number) {
  const nextValue = String(value);
  const existing = properties.find((property) => property.name === name);

  if (existing) {
    existing.value = nextValue;
    return;
  }

  properties.push({
    name,
    value: nextValue,
  });
}

export function syncOperation(properties: Property[], name: string, operation: IOperationStats) {
  const average = Number(operation.totalGasUsed) / Number(operation.totalCount);
  upsertProperty(properties, name, average);
}
