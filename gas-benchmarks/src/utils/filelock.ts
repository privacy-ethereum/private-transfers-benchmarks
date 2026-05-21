import AsyncLock from "async-lock";

import path from "path";

/**
 * In-memory async lock used to serialize operations per file path.
 *
 * @remarks
 * - Locking is scoped to a single Node.js process.
 * - Different file paths are executed concurrently.
 * - Same file path operations are queued and executed sequentially.
 * - This does NOT provide cross-process or distributed locking.
 */
const fileLock = new AsyncLock();

/**
 * Executes a function under a per-file async lock.
 * Ensures only one read-modify-write cycle runs per file path.
 */
export async function withFileLock<T>(filePath: string, method: () => Promise<T>): Promise<T> {
  const key = path.resolve(filePath);

  return await fileLock.acquire(key, method);
}
