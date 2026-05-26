import { GraphQLClient } from "graphql-request";

import path from "path";

import { CacheToFile } from "../utils/cache.js";
import {
  ARBITRUM_SUBGRAPH_URL,
  BASE_SUBGRAPH_URL,
  MAINNET_SUBGRAPH_URL,
  SEPOLIA_SUBGRAPH_URL,
} from "../utils/constants.js";
import { readJsonFile } from "../utils/json.js";

import { ArbitrumRootQuery, type TArbitrumRootQuery } from "./arbitrum.js";
import { BaseRootQuery, type TBaseRootQuery } from "./base.js";
import { MainnetRootQuery, type TMainnetRootQuery } from "./mainnet.js";
import { SepoliaRootQuery, type TSepoliaRootQuery } from "./sepolia.js";

const CACHE_FILE = path.resolve("./cache/root-query.json");
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Represents a cached GraphQL response stored in memory and on disk.
 */
export interface ICacheValue {
  /**
   * timestamp in milliseconds  indicating when the cache entry was created.
   */
  timestamp: number;

  /**
   * Cached root query response data.
   */
  data: TMainnetRootQuery & TSepoliaRootQuery;
}

/**
 * Singleton service for interacting with the subgraph API.
 *
 * This service:
 * - Creates and manages a single instance of `GraphQLClient`.
 * - Loads cached responses from disk during initialization.
 * - Fetches root query data from the subgraph.
 * - Persists responses to a file-based cache using the `@CacheToFile` decorator.
 *
 * Use {@link SubgraphService.getInstance} to obtain the initialized singleton.
 *
 * @example
 * const service = await SubgraphService.getInstance();
 * const result = await service.fetchRootQueryWithCache();
 */
export class SubgraphService {
  /**
   * Singleton instance of the service.
   */
  private static instance?: SubgraphService;

  /**
   * Arbitrum GraphQL client used to send requests to the subgraph endpoint.
   */
  private arbitrumClient: GraphQLClient;

  /**
   * Base GraphQL client used to send requests to the subgraph endpoint.
   */
  private baseClient: GraphQLClient;

  /**
   * Mainnet GraphQL client used to send requests to the subgraph endpoint.
   */
  private mainnetClient: GraphQLClient;

  /**
   * Sepolia GraphQL client used to send requests to the subgraph endpoint.
   */
  private sepoliaClient: GraphQLClient;

  /**
   * In-memory cache loaded from the cache file during initialization.
   *
   * The cache key is a serialized representation of the method name and arguments.
   */
  private cache: Map<string, ICacheValue>;

  /**
   * Returns the singleton instance of the service.
   *
   * The service is lazily created and initialized on the first call.
   * Subsequent calls return the same initialized instance.
   *
   * @returns A promise that resolves to the singleton `SubgraphService`.
   */
  static async getInstance(): Promise<SubgraphService> {
    if (!SubgraphService.instance) {
      SubgraphService.instance = new SubgraphService();

      await SubgraphService.instance.init();
    }

    return SubgraphService.instance;
  }

  /**
   * Creates a new `SubgraphService`.
   *
   * The constructor is private to enforce the singleton pattern.
   * It initializes the GraphQL clients and an empty in-memory cache.
   */
  private constructor() {
    this.arbitrumClient = new GraphQLClient(ARBITRUM_SUBGRAPH_URL);
    this.baseClient = new GraphQLClient(BASE_SUBGRAPH_URL);
    this.mainnetClient = new GraphQLClient(MAINNET_SUBGRAPH_URL);
    this.sepoliaClient = new GraphQLClient(SEPOLIA_SUBGRAPH_URL);
    this.cache = new Map<string, ICacheValue>();
  }

  /**
   * Fetches the arbitrum root query from the subgraph and caches the result to disk.
   *
   * Cached responses are stored in `CACHE_FILE` and remain valid for `CACHE_TTL`
   * milliseconds. If a valid cached response exists, it is returned instead of
   * making a network request.
   *
   * @returns A promise that resolves to the root query response, or `null`.
   */
  @CacheToFile(CACHE_FILE, CACHE_TTL)
  async fetchArbitrumRootQueryWithCache(): Promise<TArbitrumRootQuery | null> {
    return this.arbitrumClient.request<TArbitrumRootQuery>(ArbitrumRootQuery);
  }

  /**
   * Fetches the base root query from the subgraph and caches the result to disk.
   *
   * Cached responses are stored in `CACHE_FILE` and remain valid for `CACHE_TTL`
   * milliseconds. If a valid cached response exists, it is returned instead of
   * making a network request.
   *
   * @returns A promise that resolves to the root query response, or `null`.
   */
  @CacheToFile(CACHE_FILE, CACHE_TTL)
  async fetchBaseRootQueryWithCache(): Promise<TBaseRootQuery | null> {
    return this.baseClient.request<TBaseRootQuery>(BaseRootQuery);
  }

  /**
   * Fetches the mainnet root query from the subgraph and caches the result to disk.
   *
   * Cached responses are stored in `CACHE_FILE` and remain valid for `CACHE_TTL`
   * milliseconds. If a valid cached response exists, it is returned instead of
   * making a network request.
   *
   * @returns A promise that resolves to the root query response, or `null`.
   */
  @CacheToFile(CACHE_FILE, CACHE_TTL)
  async fetchMainnetRootQueryWithCache(): Promise<TMainnetRootQuery | null> {
    return this.mainnetClient.request<TMainnetRootQuery>(MainnetRootQuery);
  }

  /**
   * Fetches the sepolia root query from the subgraph and caches the result to disk.
   *
   * Cached responses are stored in `CACHE_FILE` and remain valid for `CACHE_TTL`
   * milliseconds. If a valid cached response exists, it is returned instead of
   * making a network request.
   *
   * @returns A promise that resolves to the root query response, or `null`.
   */
  @CacheToFile(CACHE_FILE, CACHE_TTL)
  async fetchSepoliaRootQueryWithCache(): Promise<TSepoliaRootQuery | null> {
    return this.sepoliaClient.request<TSepoliaRootQuery>(SepoliaRootQuery);
  }

  /**
   * Loads cached responses from the cache file into memory.
   *
   * If the cache file does not exist or contains invalid JSON,
   * an empty cache is used.
   *
   * @returns A promise that resolves when initialization is complete.
   */
  private async init(): Promise<void> {
    const fileCache = await readJsonFile<Record<string, ICacheValue>>(CACHE_FILE, {});

    Object.entries(fileCache).forEach(([key, value]) => {
      this.cache.set(key, value);
    });
  }
}
