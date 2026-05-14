import { GraphQLClient } from "graphql-request";

import path from "path";

import type {
  HinkalProtocolStatsFragmentFragment,
  FluidkeyProtocolStatsFragmentFragment,
  PrivacyPoolsProtocolStatsFragmentFragment,
  RailgunProtocolStatsFragmentFragment,
  TornadoCashProtocolStatsFragmentFragment,
} from "../generated/graphql.js";

import { graphql } from "../generated/gql.js";
import { CacheToFile } from "../utils/cache.js";
import { SUBGRAPH_URL } from "../utils/constants.js";
import { readJsonFile } from "../utils/json.js";

export type TRootQuery = RailgunProtocolStatsFragmentFragment &
  TornadoCashProtocolStatsFragmentFragment &
  HinkalProtocolStatsFragmentFragment &
  FluidkeyProtocolStatsFragmentFragment &
  PrivacyPoolsProtocolStatsFragmentFragment;

export const RootQuery = graphql(/* GraphQL */ `
  query RootQuery {
    ...RailgunProtocolStatsFragment
    ...TornadoCashProtocolStatsFragment
    ...HinkalProtocolStatsFragment
    ...FluidkeyProtocolStatsFragment
    ...PrivacyPoolsProtocolStatsFragment
  }
`);

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
  data: TRootQuery;
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
   * GraphQL client used to send requests to the subgraph endpoint.
   */
  private client: GraphQLClient;

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
   * It initializes the GraphQL client and an empty in-memory cache.
   */
  private constructor() {
    this.client = new GraphQLClient(SUBGRAPH_URL);
    this.cache = new Map<string, ICacheValue>();
  }

  /**
   * Fetches the root query from the subgraph and caches the result to disk.
   *
   * Cached responses are stored in `CACHE_FILE` and remain valid for `CACHE_TTL`
   * milliseconds. If a valid cached response exists, it is returned instead of
   * making a network request.
   *
   * @returns A promise that resolves to the root query response, or `null`.
   */
  @CacheToFile(CACHE_FILE, CACHE_TTL)
  async fetchRootQueryWithCache(): Promise<TRootQuery | null> {
    return this.client.request<TRootQuery>(RootQuery);
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
