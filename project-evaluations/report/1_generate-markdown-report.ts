import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { evaluationSchema } from "../src/data/evaluation-schema.js";
import { protocolToMarkdown } from "./protocol-to-markdown.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = join(__dirname, "report.md");

const ETHEREUM_PROJECTS = [
  "bermudabay",
  "curvy",
  "fluidkey",
  "hinkal",
  "houdiniswap",
  "nullmask",
  "privacy-pools",
  "railgun",
  "redact",
  "tongo",
  "tornado-cash",
  "worm",
  "zerc20",
];

/** Replace content between `<!-- BEGIN: <id> -->` and `<!-- END: <id> -->` with the given section. */
function updateSection(source: string, id: string, section: string): string {
  const begin = `<!-- BEGIN: ${id} -->`;
  const end = `<!-- END: ${id} -->`;
  const beginIndex = source.indexOf(begin);
  const endIndex = source.indexOf(end, beginIndex);

  if (beginIndex === -1 || endIndex === -1) {
    throw new Error(`Missing ${begin} / ${end} markers in report.md`);
  }
  return source.slice(0, beginIndex) + `${begin}\n${section}\n${end}` + source.slice(endIndex + end.length);
}

let report = readFileSync(REPORT_PATH, "utf-8");

ETHEREUM_PROJECTS.forEach((id) => {
  const path = new URL(`../src/data/evaluations/${id}.json`, import.meta.url);
  if (!existsSync(path)) throw new Error(`No evaluation JSON for ${id}`);

  const evaluation = evaluationSchema.parse(JSON.parse(readFileSync(path, "utf-8")));
  report = updateSection(report, id, protocolToMarkdown(evaluation));
  console.log(`Updated section: ${id}`);
});

writeFileSync(REPORT_PATH, report);
console.log(`Wrote ${REPORT_PATH}`);
