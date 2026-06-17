import { type Network } from "./enums";

export interface IOperationStats {
  id: string;
  totalCount: string;
  totalGasUsed: string;
}

export interface ISpecificOperationStats extends IOperationStats {
  tokenAddress?: string;
  totalValue?: string;
}

export interface IBenchmarks {
  id: string;
  totalTxCount: string;
  totalGasUsed: string;
  shield: IOperationStats & {
    shieldTokenStats: ISpecificOperationStats[];
  };
  unshield: IOperationStats & {
    unshieldTokenStats: ISpecificOperationStats[];
  };
  transact: IOperationStats;
  transfer: IOperationStats & {
    transferStats: ISpecificOperationStats[];
    averageGasUsed: string;
    averageGasPrice: string;
    averageTxFee: number;
  };
  shieldedNative: IOperationStats & {
    shieldedNativeStats: ISpecificOperationStats[];
  };
  unshielded: IOperationStats & {
    unshieldedStats: ISpecificOperationStats[];
  };
  shieldNative: IOperationStats & {
    shieldNativeTokenStats: ISpecificOperationStats[];
  };
  unshieldNative: IOperationStats & {
    unshieldNativeTokenStats: ISpecificOperationStats[];
  };
  publicToStealthETH: {
    averageGasUsed: string;
  };
  stealthToPublic: IOperationStats;
  publicToCEXETH: {
    averageGasUsed: string;
  };
  CEXToPublicETH: {
    averageGasUsed: string;
  };
  deposit: IOperationStats & {
    depositStats: ISpecificOperationStats[];
  };
  withdraw: IOperationStats & {
    withdrawStats: ISpecificOperationStats[];
  };
  depositQueued: IOperationStats & {
    depositQueuedStats: ISpecificOperationStats[];
  };
  publicToBurnETH: {
    averageGasUsed: string;
  };
  wrap: IOperationStats & {
    wrappedStats: ISpecificOperationStats[];
  };
  unwrap: IOperationStats & {
    unwrappedStats: ISpecificOperationStats[];
  };
  teleport: IOperationStats & {
    teleportedStats: ISpecificOperationStats[];
  };
  mainnet: {
    deposit: IOperationStats & {
      depositStats: ISpecificOperationStats[];
    };
  };
  scroll: {
    withdrawal: IOperationStats & {
      withdrawalStats: ISpecificOperationStats[];
    };
  };
}

export interface IETHPriceInUSD {
  ethereum: {
    usd: number;
  };
}

export interface IGasPrices {
  ethInUsd: number;
  inETH: Record<Network, bigint>;
  date: string;
}

export interface IValueAndNotes {
  value: string;
  notes: string;
}
