import { describe, it, expect, vi, beforeEach } from "vitest";

import { withFileLock } from "../utils/filelock.js";

describe("withFileLock", () => {
  const wait = (ms: number) =>
    new Promise((r) => {
      setTimeout(r, ms);
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute a single function correctly", async () => {
    const result = await withFileLock("./file.json", async () => Promise.resolve(1));

    expect(result).toBe(1);
  });

  it("should serialize concurrent calls for the same file", async () => {
    const order: number[] = [];

    const promise1 = withFileLock("./file.json", async () => {
      await wait(50);
      order.push(1);

      return 1;
    });

    const promise2 = withFileLock("./file.json", async () => {
      order.push(2);
      return Promise.resolve(2);
    });

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect([result1, result2].sort()).toEqual([1, 2]);
    expect(order).toEqual([1, 2]);
  });

  it("should allow concurrent execution for different files", async () => {
    const order: string[] = [];

    const promise1 = withFileLock("./fileA.json", async () => {
      await wait(50);
      order.push("A");
      return "A";
    });

    const promise2 = withFileLock("./fileB.json", async () => {
      order.push("B");

      return Promise.resolve("B");
    });

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect([result1, result2].sort()).toEqual(["A", "B"]);
    expect(order.sort()).toEqual(["A", "B"]);
  });

  it("should propagate errors correctly", async () => {
    await expect(
      withFileLock("./file.json", async () => {
        await Promise.resolve();
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
  });

  it("should still serialize after an error in previous task", async () => {
    const order: number[] = [];

    const promise1 = withFileLock("./file.json", async () => {
      await wait(30);
      order.push(1);
      throw new Error("fail");
    });

    const promise2 = withFileLock("./file.json", async () => {
      order.push(2);
      return Promise.resolve(2);
    });

    await expect(promise1).rejects.toThrow("fail");
    const result2 = await promise2;

    expect(result2).toBe(2);
    expect(order).toEqual([1, 2]);
  });
});
