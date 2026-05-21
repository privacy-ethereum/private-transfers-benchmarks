import { GraphQLClient } from "graphql-request";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";

import { SubgraphService } from "../subgraph/index.js";
import { CacheToFile } from "../utils/cache.js";
import { readJsonFile } from "../utils/json.js";

vi.mock("graphql-request", () => ({
  GraphQLClient: vi.fn(),
}));

vi.mock("../utils/cache.js", () => ({
  CacheToFile: vi.fn(),
}));

vi.mock("../utils/json.js", () => ({
  readJsonFile: vi.fn(),
}));

describe("SubgraphService", () => {
  const cachedData = {
    timestamp: Date.now(),
    data: { data: "cached-response" },
  };

  function mockedGraphQLClient() {
    return {
      request: vi.fn().mockResolvedValue({
        data: "mocked-response",
      }),
    };
  }

  beforeEach(() => {
    vi.useFakeTimers();

    vi.mocked(GraphQLClient).mockImplementation(mockedGraphQLClient);
    vi.mocked(readJsonFile).mockResolvedValue(cachedData);
    vi.mocked(CacheToFile).mockImplementation(() => vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize service properly", async () => {
    const service = await SubgraphService.getInstance();

    expect(service).toBeInstanceOf(SubgraphService);
    expect(readJsonFile).toHaveBeenCalledTimes(1);
  });

  it("should fetch data properly", async () => {
    const service = await SubgraphService.getInstance();

    const results = await Promise.all([
      service.fetchMainnetRootQueryWithCache(),
      service.fetchSepoliaRootQueryWithCache(),
    ]);

    expect(results[0]).toEqual({ data: "mocked-response" });
    expect(results[1]).toEqual({ data: "mocked-response" });
    expect(readJsonFile).toHaveBeenCalledTimes(0);
  });
});
