import fs from "fs/promises";

/**
 * Reads and parses a JSON file.
 *
 * If the file does not exist or contains invalid JSON, the provided fallback
 * value is returned instead.
 *
 * @template T - The expected shape of the parsed JSON data.
 * @param filePath - Absolute or relative path to the JSON file.
 * @param fallback - Value to return when the file is missing or cannot be parsed.
 * @returns A promise that resolves to the parsed JSON content or the fallback value.
 *
 * @example
 * // Returns an empty object if the file does not exist or is invalid
 * const cache = await readJsonFile<Record<string, string>>(
 *   "./cache.json",
 *   {},
 * );
 */
export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  const exists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    return fallback;
  }

  const raw = await fs.readFile(filePath, "utf8");

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
