---
name: research-sources
description: Find authoritative source URLs for each property of a protocol evaluation using WebSearch/WebFetch, then write the results to scripts/research-cache/{id}.json so the API research script can consume them without spending API credits on web search.
---

# Research Sources

Populate the research cache consumed by `pnpm run research <protocol>`. This skill handles the web-search / source-discovery half of the pipeline entirely within Claude Code (subscription-billed) so the Anthropic API phase only pays for citations extraction.

## Arguments

- `<protocol>` — required. The protocol id, matching a key in `scripts/research-config.ts`.
- `--only "A,B"` — optional. Restrict discovery to the named properties. Matches the semantics of `pnpm run research --only`.

## Instructions

1. **Load config.** Read `scripts/research-config.ts` and resolve the entry for `<protocol>`. Extract `id`, `title`, `description`, `sourceUrls`, and `context`. If the id is missing, list available ids and stop.

2. **Load schema.** Read `src/data/schema.ts`. Build the property list by filtering `PROPERTY_DEFINITIONS` against the `SKIP_PROPERTIES` set declared in `scripts/research-config.ts` (currently: `Anonymity set size`, `On-chain gas cost: deposit`, `On-chain gas cost: transfer`, `On-chain gas cost: withdraw`). If `--only` was supplied, further restrict to those names.

3. **Load rules.** Read `scripts/research-prompts.ts` for the cross-cutting blocks. Apply `SOURCE_SELECTION_RULES` when choosing URLs — reject PDFs, prefer official docs over third-party blogs, reject landing/navigation pages, point at specific READMEs rather than repo roots. **URL workflow (1–3 sources, two is the default):** discover up to three independent sources per property (different domains where possible — e.g. official docs + L2BEAT, official docs + GitHub README, official docs + audit report). Two is the default and has been load-bearing in practice; add a third only when distinct load-bearing claims rest on distinct documents (e.g. mechanism in docs + compliance gate in contract README + dated-deployment evidence in a separate announcement). One URL is acceptable when a single source covers every claim (e.g. a license file for Open source). Every recorded URL will be ingested by the research script even if only one ends up cited (`SOURCE_SELECTION_RULES #6`). For per-property guidance, read `.claude/skills/property-rules-{group}/SKILL.md` for the relevant group (privacy, compliance, trust, cryptography, state-model, timing, composability). For the four compliance properties and `Upgradeability`, also apply the `CROSS_CHECK_RULES` contract-level compliance audit — inspect the contract repository directly, not just the whitepaper.

4. **Load the existing cache if present.** `scripts/research-cache/{id}.json`. If it exists, treat its entries as prior work — re-use the `urls` and `summary` for any property you aren't currently refreshing. When `--only` is supplied, only the listed properties are re-discovered; all others are copied through unchanged. Legacy entries with a single `url` field are still readable but should be upgraded to `urls` next time you touch them.

5. **For each in-scope property**, use `WebSearch` and `WebFetch` to identify 1–3 independent source URLs (two is the default):
   - Start from `config.sourceUrls` and the official docs. **Before declaring the docs site empty, probe `/sitemap.xml` and `/llms.txt` first** — many docs sites have a placeholder root but a populated sitemap (e.g. `docs.{protocol}.xyz/` returns only the protocol name, while `docs.{protocol}.xyz/sitemap.xml` lists 20+ substantive subpages under `/tech/`, `/compliance/`, `/sdk/`). Never fall back to the marketing apex domain (`{protocol}.xyz/`) as a substitute — that's a SOURCE_SELECTION_RULES #1 violation.
   - When no single page answers the property, issue a `WebSearch` scoped to the protocol's name plus keywords from the property (e.g. `"{protocol} upgradeability proxy admin"`).
   - Fetch candidate URLs with `WebFetch` to confirm they contain the required technical content.
   - For smart-contract-based protocols evaluating the four compliance properties or `Upgradeability`, inspect the contract repo (look for proxy patterns, `onlyOwner` gates, blocklist hooks) — the correct URL may be a contract README or deployment script, not the whitepaper.
   - Reject URLs that fail `no-pdf-sources`, `official-sources-only`, or `specific-technical-page`.
   - **Primary + secondary (default):** find a primary source (best technical content) AND an independent secondary source (different domain — L2BEAT, audit report, GitHub README, ethresear.ch design discussion). The primary is what the LLM will likely cite; the secondary gives cross-reference.
   - **Add a third only when warranted:** if a single property's load-bearing claims span content that no two sources cover together (e.g. mechanism in docs + compliance gate in contract README + dated-deployment evidence in an audit report), record a third URL.
   - **Single source is fine when one document carries every claim** (e.g. a licence file for Open source, a block-explorer page for an admin classification).
   - **Load-bearing span requirement:** for each chosen URL, identify the specific sentence(s) on that page that prove the load-bearing claim — not adjacent architecture context, not landing-page chrome. The fetched page text is what the API will extract spans from, so the source must literally contain the substantive sentence the value rests on. If a candidate page only contains adjacent context without the load-bearing sentence, look for a different page on the same site that does.

6. **Compose a short factual `summary`** (≤400 characters) describing what those pages establish about this property. The summary will be fed into the citations phase of the API script — it should be concrete, not narrative. When the property's load-bearing claim is one specific sentence in the source, quote that sentence near-verbatim in the summary so the API biases toward extracting the substantive span (rather than adjacent architecture context). If the sources disagree on a fact, mention the disagreement in the summary so the reviewer-LLM sees both views.

7. **Write the cache file** at `scripts/research-cache/{id}.json`:

   ```json
   {
     "id": "<protocol>",
     "generatedAt": "<ISO8601>",
     "properties": [{ "name": "Confidentiality", "urls": ["https://primary…", "https://secondary…"], "summary": "…" }]
   }
   ```

   - `properties` must contain an entry for every non-skipped, non-filtered property.
   - Each entry has a `urls` array (length 1, 2, or 3) — primary first, then secondary, then optional tertiary. Two is the default.
   - Preserve previously-cached entries for properties outside the current `--only` filter.

## Output

Print a one-line summary per property while working (`{property} → {url}`) and a final line:

```
Wrote scripts/research-cache/{id}.json ({N} properties)
Next: pnpm run research {id} [--only "A,B"]
```

## Failure modes

- **No acceptable URL found for a property**: write the property entry with `urls: []` and a summary explaining why. The API script will flag the property as `INSUFFICIENT_DATA`.
- **Config entry missing or `sourceUrls` set to `"TODO"`**: stop and tell the user to populate `scripts/research-config.ts` first.
- **`--only` names a property not in the schema**: stop with the list of valid property names.
