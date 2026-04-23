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

2. **Load schema.** Read `src/data/schema.ts`. Build the property list by filtering `PROPERTY_DEFINITIONS` against the `SKIP_PROPERTIES` set declared in `scripts/research-protocol.ts` (currently: `Anonymity set size`, `On-chain gas cost: deposit`, `On-chain gas cost: transfer`, `On-chain gas cost: withdraw`). If `--only` was supplied, further restrict to those names.

3. **Load rules.** Read `scripts/research-prompts.ts`. Apply `SOURCE_SELECTION_RULES` when choosing URLs — reject PDFs, prefer official docs over third-party blogs, reject landing/navigation pages, point at specific READMEs rather than repo roots. When the property matches a key in `PROPERTY_RULES`, read that entry too and use it to decide what the source needs to prove. For the four compliance properties and `Upgradeability`, also apply the `CROSS_CHECK_RULES` contract-level compliance audit — inspect the contract repository directly, not just the whitepaper.

4. **Load the existing cache if present.** `scripts/research-cache/{id}.json`. If it exists, treat its entries as prior work — re-use the `url` and `summary` for any property you aren't currently refreshing. When `--only` is supplied, only the listed properties are re-discovered; all others are copied through unchanged.

5. **For each in-scope property**, use `WebSearch` and `WebFetch` to identify the single best source URL:
   - Start from `config.sourceUrls` and the official docs.
   - When no single page answers the property, issue a `WebSearch` scoped to the protocol's name plus keywords from the property (e.g. `"{protocol} upgradeability proxy admin"`).
   - Fetch candidate URLs with `WebFetch` to confirm they contain the required technical content.
   - For smart-contract-based protocols evaluating the four compliance properties or `Upgradeability`, inspect the contract repo (look for proxy patterns, `onlyOwner` gates, blocklist hooks) — the correct URL may be a contract README or deployment script, not the whitepaper.
   - Reject URLs that fail `no-pdf-sources`, `official-sources-only`, or `specific-technical-page`.

6. **Compose a short factual `summary`** (≤400 characters) describing what that page establishes about this property. The summary will be fed into the citations phase of the API script — it should be concrete, not narrative.

7. **Write the cache file** at `scripts/research-cache/{id}.json`:

   ```json
   {
     "id": "<protocol>",
     "generatedAt": "<ISO8601>",
     "properties": [{ "name": "Confidentiality", "url": "https://…", "summary": "…" }]
   }
   ```

   - `properties` must contain an entry for every non-skipped, non-filtered property.
   - Preserve previously-cached entries for properties outside the current `--only` filter.

## Output

Print a one-line summary per property while working (`{property} → {url}`) and a final line:

```
Wrote scripts/research-cache/{id}.json ({N} properties)
Next: pnpm run research {id} [--only "A,B"]
```

## Failure modes

- **No acceptable URL found for a property**: write the property entry with `url: ""` and a summary explaining why. The API script will flag the property as `INSUFFICIENT_DATA`.
- **Config entry missing or `sourceUrls` set to `"TODO"`**: stop and tell the user to populate `scripts/research-config.ts` first.
- **`--only` names a property not in the schema**: stop with the list of valid property names.
