import { existsSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";
import puppeteer from "puppeteer-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = join(__dirname, "report.md");
const TEMPLATE_PATH = join(__dirname, "report-template.html");
const PDF_OUTPUT_PATH = join(__dirname, "..", "public", "report.pdf");

const CHROME_PATHS: Record<string, string[]> = {
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ],
  linux: ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"],
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ],
};

/** Resolve a system Chrome / Chromium executable. Honors the `CHROME_PATH` env var, then falls back to OS-specific defaults. */
function findChrome(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = CHROME_PATHS[process.platform] ?? [];
  const found = candidates.find((path) => existsSync(path));

  if (found) return found;
  throw new Error(
    `Could not find Chrome on ${process.platform}. Set CHROME_PATH env var to your Chrome/Chromium executable. Tried: ${candidates.join(", ")}`,
  );
}

const markdown = readFileSync(REPORT_PATH, "utf-8");
const template = readFileSync(TEMPLATE_PATH, "utf-8");
const renderedBody = await marked.parse(markdown); // converts markdown to HTML
const html = template.replace("{{content}}", renderedBody); // adds HTML to the template

mkdirSync(dirname(PDF_OUTPUT_PATH), { recursive: true });

const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({
  path: PDF_OUTPUT_PATH,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();

console.log(`Wrote ${PDF_OUTPUT_PATH}`);
