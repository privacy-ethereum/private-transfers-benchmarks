import fs from "fs/promises";
import path from "path";

import { readJsonFile } from "./json.js";

/**
 * Creates a method decorator that caches asynchronous method results to a JSON file.
 *
 * The decorated method uses its method name and serialized arguments as a cache key.
 * On each invocation:
 *
 * 1. The cache file is loaded from disk.
 * 2. If a valid cached entry exists and has not expired, the cached value is returned.
 * 3. Otherwise, the original method is executed.
 * 4. The result is stored in the cache file along with the current timestamp.
 *
 * Cache entries expire after the specified time-to-live (TTL).
 *
 * @param filePath - Path to the JSON file used to persist cached values.
 * @param ttlMs - Cache time-to-live in milliseconds.
 * @returns A method decorator for async methods that return a `Promise<T>`.
 *
 * @example
 * class ApiService {
 *   @CacheToFile("./cache/users.json", 60_000)
 *   async getUsers(): Promise<User[]> {
 *     return fetchUsersFromApi();
 *   }
 * }
 *
 * @remarks
 * - Only works with asynchronous methods that return a `Promise`.
 * - Cache keys are generated using `JSON.stringify` on the method name and arguments.
 * - If the cache file does not exist or contains invalid JSON, an empty cache is used.
 * - The cache file is written with two-space indentation for readability.
 * - Arguments must be JSON-serializable to produce stable cache keys.
 */
export function CacheToFile(filePath: string, ttlMs: number) {
  return function cacheToFileDecorator<T>(
    _target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>>,
  ): TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>> {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      return descriptor;
    }

    // eslint-disable-next-line no-param-reassign
    descriptor.value = async function withCache(this: unknown, ...args: unknown[]): Promise<T> {
      const cacheKey = JSON.stringify({ method: String(propertyKey), args });
      const fileCache = await readJsonFile<Record<string, { timestamp: number; data: T }>>(filePath, {});

      const now = Date.now();
      const cached = fileCache[cacheKey];

      if (cached && now - cached.timestamp < ttlMs) {
        return cached.data;
      }

      const result = await originalMethod.apply(this, args);

      fileCache[cacheKey] = { timestamp: now, data: result };

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(path.resolve(filePath), JSON.stringify(fileCache, null, 2), "utf8");

      return result;
    };

    return descriptor;
  };
}
