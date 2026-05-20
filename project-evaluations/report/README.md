# Report

This directory contains the State of Private Transfers Report, and a pipeline to directly insert the content from the json evaluations in `../src/data/evaluations/` into the report pdf served at `/report.pdf`.

## Usage

```sh
pnpm generate:markdown-report   # Generates the markdown report based on latest JSON files
pnpm generate:pdf-report      # Generates the actual PDF that gets served at public/report.pdf
```

`pnpm build` runs `generate:pdf-report` automatically before `vite build`.

To view the PDF locally, start the dev server (`pnpm dev`) and open <http://localhost:5173/report.pdf>.

The report is also generated on project build so it lives at `<host>/report.pdf` on the live website (e.g. `https://private-transfers.pse.dev/report.pdf`).

## Files

- `1_generate-markdown-report.ts` — reads evaluation JSONs and adds them to `report.md`.

- `2_convert-markdown-to-pdf-report.ts` — renders `report.md` to HTML with `marked`, drops it into the template, then prints to `../public/report.pdf` via `puppeteer-core`.

- `protocol-to-markdown.ts` — utiliy that converts single `Evaluation` to one markdown section.

- `report-template.html` — print-styled HTML wrapper with a `{{content}}` placeholder. Controls fonts, page margins, headings, link colors, etc.

- `report.md` — the markdown report which can be manually edited. Content between `<!-- BEGIN: <id> -->` and `<!-- END: <id> -->` is auto-generated from evaluations

## Editing workflow

1. Edit `report.md` directly for non-evaluation content
2. When a JSON evaluation changes, run `pnpm generate:markdown-report`
3. Run `pnpm generate:pdf-report` to update the PDF

## Chrome lookup

`2_convert-markdown-to-pdf-report.ts` uses `puppeteer-core` and finds Chrome via OS-specific defaults (macOS / Linux / Windows). Override with the `CHROME_PATH` env var if your install lives elsewhere.
