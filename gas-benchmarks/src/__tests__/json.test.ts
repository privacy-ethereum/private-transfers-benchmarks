import { vi, describe, expect, it, beforeEach, afterEach } from "vitest";

import fs from "fs/promises";

import { readJsonFile } from "../utils/json.js";

vi.mock("fs/promises", () => ({
  default: {
    access: vi.fn(),
    readFile: vi.fn(),
  },
}));

describe("Read json file", () => {
  const defaultFileData = { key: 1 };

  beforeEach(() => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(defaultFileData));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should read json file properly", async () => {
    const result = await readJsonFile("test.json", {});

    expect(result).toEqual(defaultFileData);
  });

  it("should return default value if file is not found", async () => {
    vi.mocked(fs.access).mockRejectedValue(undefined);

    const result = await readJsonFile("test.json", {});

    expect(result).toEqual({});
  });

  it("should return default value if json is invalid", async () => {
    vi.mocked(fs.readFile).mockResolvedValue("invalid json");

    const result = await readJsonFile("test.json", {});

    expect(result).toEqual({});
  });
});
