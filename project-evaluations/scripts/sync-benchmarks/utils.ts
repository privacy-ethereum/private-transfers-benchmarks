import { type Property } from "../../src/types";
import { type IOperationStats } from "./interfaces";

export const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

export const DEPOSIT_PROPERTY_NAME = "On-chain gas cost: deposit";
export const TRANSFER_PROPERTY_NAME = "On-chain gas cost: transfer";
export const WITHDRAW_PROPERTY_NAME = "On-chain gas cost: withdraw";

export enum Protocol {
  Blanksquare = "blanksquare",
  Curvy = "curvy",
  Fluidkey = "fluidkey",
  Hinkal = "hinkal",
  Houdiniswap = "houdiniswap",
  Intmax = "intmax",
  Monero = "monero",
  PrivacyPools = "privacy-pools",
  Railgun = "railgun",
  Redact = "redact",
  TornadoCash = "tornado-cash",
  VeilCash = "veil-cash",
  Worm = "worm",
  ZERC20 = "zerc20",
}

export function upsertProperty(properties: Property[], name: string, value: number): boolean {
  const nextValue = String(value);
  const existing = properties.find((property) => property.name === name);

  if (existing) {
    existing.value = nextValue;
    return true;
  }

  properties.push({
    name,
    value: nextValue,
  });

  return true;
}

export function syncOperation(properties: Property[], name: string, operation: IOperationStats) {
  const average = Number(operation.totalGasUsed) / Number(operation.totalCount);
  upsertProperty(properties, name, average);
}
