import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { evaluationSchema } from "../../src/data/evaluation-schema";
import type { Property } from "../../src/types";

type MaturityProperty = Extract<Property, { name: "Implementation maturity" }>;
type UpgradeabilityProperty = Extract<Property, { name: "Upgradeability" }>;

const evaluationsDir = join(dirname(fileURLToPath(import.meta.url)), "../../src/data/evaluations");

/** Evaluations authored before the new max caps feature. Migrations can occur in future PRs. */
const LEGACY_PROTOCOLS = new Set([
  "bermudabay",
  "curvy",
  "fluidkey",
  "hinkal",
  "houdiniswap",
  "intmax",
  "mirage",
  "monero",
  "nullmask",
  "privacy-pools",
  "railgun",
  "redact",
  "tongo",
  "tornado-cash",
  "worm",
  "zcash",
  "zerc20",
]);

const NOTES_MAX_LEGACY = 700;
const NOTES_MAX_NEW = 500;
const CITED_TEXT_MAX = 200;

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

function parseSchema(file: string, json: unknown, issues: Issue[]) {
  const parsed = evaluationSchema.safeParse(json);
  if (parsed.success) return;
  for (const schemaIssue of parsed.error.issues) {
    issues.push({
      file,
      property: schemaIssue.path.join("."),
      rule: "schema",
      error: schemaIssue.message,
    });
  }
}

function checkDescription(file: string, propertyName: string, description: string, notesMax: number, issues: Issue[]) {
  const push = (rule: string, error: string) => issues.push({ file, property: propertyName, rule, error });

  if (description.includes(" ,")) push("punctuation", "space-before-comma");
  if (description.includes(" .")) push("punctuation", "space-before-period");
  if (description.includes(";")) push("semicolon-in-description", "use full stop or em-dash");
  if (description.length > notesMax) push("description-too-long", `${description.length} chars (max ${notesMax})`);

  const lower = description.toLowerCase();
  for (const phrase of VAGUE_PHRASES) if (lower.includes(phrase)) push("vague-phrase", phrase);
  for (const root of VAGUE_WORD_ROOTS) if (lower.includes(root)) push("vague-phrase", `${root}*`);
  if (VAGUE_IMPLY.test(description)) push("vague-phrase", "imply/implies/implying");

  if (!PROPERTIES_ALLOWING_FILENAMES.has(propertyName)) {
    const match = FILENAME_PATTERN.exec(description);
    if (match) push("filename-in-description", match[0]);
  }
}

function checkMaturityDate(file: string, property: MaturityProperty, legacy: boolean, issues: Issue[]) {
  if (!property.value || property.needsResearchReview) return;

  const citations = property.citations ?? [];
  const hasEvidence = legacy
    ? citations.some((citation) => typeof citation.cited_text === "string" && YEAR_TOKEN.test(citation.cited_text))
    : citations.some((citation) => typeof citation.date === "string");
  if (hasEvidence) return;

  issues.push({
    file,
    property: property.name,
    rule: legacy ? "maturity-date-citation" : "maturity-typed-date",
    error: legacy
      ? "requires a YYYY date in a citation's cited_text or a needsResearchReview reason"
      : 'requires at least one citation with `date: "YYYY-MM-DD"` or a needsResearchReview reason',
  });
}

function checkUpgradeability(file: string, property: UpgradeabilityProperty, legacy: boolean, issues: Issue[]) {
  if (legacy || property.needsResearchReview) return;
  if (typeof property.value !== "string" || !property.value || property.value === "Immutable") return;
  const push = (rule: string, error: string) => issues.push({ file, property: property.name, rule, error });

  const adminCitation = (property.citations ?? []).find((citation) => typeof citation.admin_class === "string");
  if (!adminCitation) {
    push(
      "upgrade-admin-class-required",
      `value "${property.value}" requires a citation with admin_class or a needsResearchReview reason`,
    );
    return;
  }
  if (adminCitation.admin_class !== property.value) {
    push(
      "upgrade-admin-class-mismatch",
      `admin_class "${adminCitation.admin_class!}" does not match value "${property.value}"`,
    );
  }
}

function checkCitations(file: string, property: Property, legacy: boolean, issues: Issue[]) {
  if (legacy) return;
  const push = (rule: string, error: string) => issues.push({ file, property: property.name, rule, error });

  for (const citation of property.citations ?? []) {
    const citedText = citation.cited_text;
    if (typeof citedText !== "string") continue;
    if (citedText.length > CITED_TEXT_MAX) {
      push("cited-text-too-long", `${citedText.length} chars (max ${CITED_TEXT_MAX})`);
    }
    if (citedText.includes(" ,")) push("cited-text-punctuation", "space-before-comma");
    if (citedText.includes(" .")) push("cited-text-punctuation", "space-before-period");
  }
}

const issues: Issue[] = [];
const files = readdirSync(evaluationsDir).filter((filename) => filename.endsWith(".json"));
for (const file of files) {
  const legacy = LEGACY_PROTOCOLS.has(file.replace(/\.json$/, ""));
  const notesMax = legacy ? NOTES_MAX_LEGACY : NOTES_MAX_NEW;
  const json = JSON.parse(readFileSync(join(evaluationsDir, file), "utf-8"));

  parseSchema(file, json, issues);

  if (typeof json.description === "string" && json.description.includes(";")) {
    issues.push({ file, property: "(top-level)", rule: "semicolon-in-description", error: "use full stop or em-dash" });
  }

  for (const property of (json.properties ?? []) as Property[]) {
    if (typeof property.notes === "string" && property.notes.length > 0) {
      checkDescription(file, property.name, property.notes, notesMax, issues);
    }

    checkCitations(file, property, legacy, issues);

    if (property.name === "Implementation maturity") {
      checkMaturityDate(file, property as MaturityProperty, legacy, issues);
    }
    if (property.name === "Upgradeability") {
      checkUpgradeability(file, property as UpgradeabilityProperty, legacy, issues);
    }
  }
}

if (issues.length === 0) {
  console.log(`lint:evaluations passed (${files.length} files)`);
} else {
  for (const issue of issues) console.error(`${issue.file} [${issue.rule}] ${issue.property}: ${issue.error}`);
  console.error(`\n${issues.length} issue(s)`);
  process.exit(1);
}
