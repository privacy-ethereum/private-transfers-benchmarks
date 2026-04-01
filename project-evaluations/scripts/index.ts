import { readFileSync, writeFileSync } from "fs";
import { configs } from "./research-config";
import { evaluateProperties } from "./research-protocol";
import { Evaluation, Property } from "../src/types";

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const positional = args.filter((a) => !a.startsWith("--"));
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? args[onlyIdx + 1]?.split(",").map((s) => s.trim()) : undefined;

  const protocolId = positional[0];
  if (!protocolId || !configs[protocolId]) {
    console.error(
      `Usage: pnpm run research <protocol> [--only "A,B"]\n` + `Available: ${Object.keys(configs).join(", ")}`,
    );
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is required");
    process.exit(1);
  }

  const config = configs[protocolId];
  const evalPath = new URL(`../src/data/evaluations/${config.id}.json`, import.meta.url);
  const existingProperties: Property[] = JSON.parse(readFileSync(evalPath, "utf-8")).properties;

  const properties = await evaluateProperties(config, existingProperties, only ?? []);

  const evaluation: Evaluation = {
    id: config.id,
    title: config.title,
    description: config.description,
    documentation: config.documentation,
    categories: config.categories as Evaluation["categories"],
    properties,
  };
  writeFileSync(evalPath, JSON.stringify(evaluation, null, 2) + "\n");
  console.log(`Wrote ${evalPath.pathname}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
