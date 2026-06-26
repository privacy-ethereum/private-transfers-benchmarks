import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import puppeteer from "puppeteer-core";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "subgraph-benchmark-audit.md");
const OUT = join(here, "..", "subgraph-benchmark-audit.pdf");

const CHROME = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
]
  .filter(Boolean)
  .find((p) => existsSync(p));
if (!CHROME) throw new Error("No Chrome found; set CHROME_PATH");

const md = readFileSync(SRC, "utf8");
let body = await marked.parse(md, { gfm: true });

const badge = (word: string, cls: string): void => {
  body = body.replaceAll(`<td>${word}</td>`, `<td><span class="badge ${cls}">${word}</span></td>`);
};
badge("Critical", "crit");
badge("High", "high");
badge("Medium", "med");
badge("Low", "low");
badge("Informational", "info");
badge("Confirmed", "ok");
badge("Inconclusive", "warn");
badge("Refuted", "muted");

const HEADING_CLS: Record<string, string> = {
  Critical: "crit",
  High: "high",
  Medium: "med",
  Low: "low",
  Informational: "info",
};
body = body.replace(
  /<h3>(Critical|High|Medium|Low|Informational) (\d+)(.*?)<\/h3>/g,
  (_m: string, sev: string, num: string, rest: string) =>
    `<h3 class="finding"><span class="badge ${HEADING_CLS[sev]}">${sev} ${num}</span>${rest}</h3>`,
);

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: A4; margin: 22mm 18mm; }
* { box-sizing: border-box; }
body { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  font-size: 10.5pt; line-height: 1.5; color: #1a1a1a; max-width: 760px; margin: 0 auto; }
h1 { font-size: 24pt; margin: 0 0 14pt; line-height: 1.2; color: #111; }
h2 { font-size: 16pt; margin: 24pt 0 8pt; padding-bottom: 4pt; border-bottom: 2px solid #1d4ed8; page-break-after: avoid; }
h3 { font-size: 12pt; margin: 16pt 0 5pt; page-break-after: avoid; color: #1f2937; }
p, li { font-size: 10.5pt; }
code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 9pt; background: #f3f4f6; padding: 0 3px; border-radius: 3px; }
a { color: #1d4ed8; text-decoration: none; }
table { border-collapse: collapse; width: 100%; margin: 10pt 0; font-size: 8.5pt; page-break-inside: avoid; }
th, td { border: 1px solid #d4d4d4; padding: 4pt 6pt; text-align: left; vertical-align: top; word-break: break-word; }
td code { word-break: break-all; white-space: normal; }
th { background: #f5f5f5; font-weight: 600; }
.badge { display: inline-block; padding: 1px 7px; border-radius: 10px; font-size: 7.5pt; font-weight: 600; white-space: nowrap; }
h3.finding { padding-top: 13pt; margin-top: 20pt; position: relative; }
h3.finding::before { content: ""; position: absolute; top: 0; left: 4px; right: 0; border-top: 1px solid #e5e7eb; }
h3.finding .badge { font-size: inherit; vertical-align: middle; margin-right: 7px; }
.crit { background: #fce8e6; color: #9b1c1c; }
.high { background: #fdebd0; color: #9a4a00; }
.med  { background: #fef7e0; color: #8a6d00; }
.low  { background: #eef2ff; color: #1d4ed8; }
.info { background: #f0f0f0; color: #555; }
.ok   { background: #e6f4ea; color: #1e7a3a; }
.warn { background: #fef7e0; color: #8a6d00; }
.muted{ background: #f0f0f0; color: #777; }
.cover { display: flex; flex-direction: column; justify-content: center; min-height: 244mm; text-align: center; page-break-after: always; }
.cover__title { font-size: 30pt; line-height: 1.15; margin: 0 0 12pt; color: #111; }
.cover__subtitle { font-size: 13pt; color: #555; margin: 0 0 40pt; }
.cover__meta p { font-size: 10pt; color: #555; margin: 2pt 0; }
blockquote { border-left: 3px solid #d4d4d4; margin: 8pt 0; padding: 2pt 12pt; color: #555; }
</style></head><body>${body}</body></html>`;

const debugHtml = join(here, "report.html");
writeFileSync(debugHtml, html);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: OUT, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`wrote ${OUT}`);
