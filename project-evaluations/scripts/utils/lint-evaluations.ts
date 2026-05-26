import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const evaluationsDir = join(dirname(fileURLToPath(import.meta.url)), "../../src/data/evaluations");

const MAX_CHARS = 700;
const PROPERTIES_ALLOWING_FILENAMES = new Set(["Upgradeability", "Open source"]);
const VAGUE_PHRASES = ["we assume", "it appears that", "the document", "prior research"];
const VAGUE_WORD_ROOTS = ["indicat", "suggest", "confirm"];

const FILENAME_PATTERN = /\b\w+\.(sol|circom|rs|ts)\b/;
const YEAR_TOKEN = /\b20\d{2}\b/;
const VAGUE_IMPLY = /\bimpl(y|ies|ying)\b/i;

interface Issue {
  file: string;
  property: string;
  rule: string;
  error: string;
}

function checkDescription(file: string, propertyName: string, description: string, issues: Issue[]) {
  const push = (rule: string, error: string) => issues.push({ file, property: propertyName, rule, error });

  if (description.includes(" ,")) push("punctuation", "space-before-comma");
  if (description.includes(" .")) push("punctuation", "space-before-period");
  if (description.includes(";")) push("semicolon-in-description", "use full stop or em-dash");
  if (description.length > MAX_CHARS) push("description-too-long", `${description.length} chars (max ${MAX_CHARS})`);

  const lower = description.toLowerCase();
  for (const phrase of VAGUE_PHRASES) if (lower.includes(phrase)) push("vague-phrase", phrase);
  for (const root of VAGUE_WORD_ROOTS) if (lower.includes(root)) push("vague-phrase", `${root}*`);
  if (VAGUE_IMPLY.test(description)) push("vague-phrase", "imply/implies/implying");

  if (!PROPERTIES_ALLOWING_FILENAMES.has(propertyName)) {
    const match = FILENAME_PATTERN.exec(description);
    if (match) push("filename-in-description", match[0]);
  }
}

function checkMaturityDate(file: string, property: any, issues: Issue[]) {
  if (typeof property.value !== "string" || property.value.length === 0) return;
  if (typeof property.needsResearchReview === "string" && property.needsResearchReview.length > 0) return;
  const citations = Array.isArray(property.citations) ? property.citations : [];
  const hasDate = citations.some(
    (citation: any) => typeof citation?.cited_text === "string" && YEAR_TOKEN.test(citation.cited_text),
  );
  if (!hasDate) {
    issues.push({
      file,
      property: "Implementation maturity",
      rule: "maturity-date-citation",
      error: "requires a YYYY date in a citation's cited_text or a needsResearchReview reason naming the missing date",
    });
  }
}

const issues: Issue[] = [];
const files = readdirSync(evaluationsDir).filter((file) => file.endsWith(".json"));
for (const file of files) {
  const json = JSON.parse(readFileSync(join(evaluationsDir, file), "utf-8"));
  if (typeof json.description === "string" && json.description.includes(";")) {
    issues.push({
      file,
      property: "(top-level)",
      rule: "semicolon-in-description",
      error: "use full stop or em-dash",
    });
  }
  for (const property of json.properties ?? []) {
    if (typeof property.notes === "string" && property.notes.length > 0) {
      checkDescription(file, property.name, property.notes, issues);
    }
    if (property.name === "Implementation maturity") checkMaturityDate(file, property, issues);
  }
}

if (issues.length === 0) {
  console.log(`lint:evaluations passed (${files.length} files)`);
} else {
  for (const issue of issues) console.error(`${issue.file} [${issue.rule}] ${issue.property}: ${issue.error}`);
  console.error(`\n${issues.length} issue(s)`);
  process.exit(1);
}
