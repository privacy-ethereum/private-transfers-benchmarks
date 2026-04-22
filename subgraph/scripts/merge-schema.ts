import { readdir, readFile, writeFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const mergeSchema = async () => {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const subgraphDir = resolve(scriptDir, "..");
  const schemasDir = join(subgraphDir, "schemas");

  const files = (await readdir(schemasDir)).filter((file) => file.endsWith(".graphql")).sort();

  const merged = (await Promise.all(files.map((file) => readFile(join(schemasDir, file), "utf8")))).join("\n");

  const out = join(subgraphDir, "schema.graphql");
  await writeFile(out, merged);
};

mergeSchema().catch((err) => {
  console.error("Failed to merge schema:", err);
  process.exit(1);
});
