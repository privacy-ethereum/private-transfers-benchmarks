import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import fs from "fs/promises";
import path from "path";

import { CacheToFile } from "../utils/cache.js";
import { readJsonFile } from "../utils/json.js";

vi.mock("fs/promises", () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  },
}));

vi.mock("../utils/json.js", () => ({
  readJsonFile: vi.fn(),
}));

class TestService {
  @CacheToFile("./cache/test.json", 1000)
  async getData(): Promise<string> {
    return Promise.resolve("fresh-data");
  }
}

describe("CacheToFile decorator", () => {
  const cacheKey = JSON.stringify({
    method: "getData",
    args: [],
  });

  beforeEach(() => {
    vi.useFakeTimers();

    vi.mocked(readJsonFile).mockResolvedValue({});
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call method and write cache on miss", async () => {
    const service = new TestService();

    const result = await service.getData();

    expect(result).toBe("fresh-data");
    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname("./cache/test.json"), { recursive: true });
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it("recomputes when cache is expired", async () => {
    const oldTime = Date.now() - 10_000;

    vi.mocked(readJsonFile).mockResolvedValue({
      [cacheKey]: {
        timestamp: oldTime,
        data: "old-data",
      },
    });

    const service = new TestService();

    const result = await service.getData();

    expect(result).toBe("fresh-data");
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it("should returns cached value when valid", async () => {
    const now = Date.now();

    vi.mocked(readJsonFile).mockResolvedValue({
      [cacheKey]: {
        timestamp: now,
        data: "cached-data",
      },
    });

    const service = new TestService();

    const result = await service.getData();

    expect(result).toBe("cached-data");
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it("returns descriptor unchanged when method is missing", () => {
    const descriptor = { value: undefined };

    const result = CacheToFile("./cache/test.json", 1000)(
      {},
      "testMethod",
      descriptor as unknown as TypedPropertyDescriptor<(...args: unknown[]) => Promise<unknown>>,
    );

    expect(result).toBe(descriptor);
    expect(result.value).toBeUndefined();
  });
});
