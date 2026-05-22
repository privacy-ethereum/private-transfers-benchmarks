# Research scripts

## Usage

Evaluate one protocol end to end with `/evaluate-protocol <id>`, or run the steps
individually. Every step accepts `--only "A,B"` to restrict it to named properties.

1. Add the protocol to research-config.ts.
2. `/research-sources <id>` — finds source URLs and writes the research cache.
3. `pnpm run research <id>` — fetches each cached URL, calls the citations API per
   property, and writes src/data/evaluations/<id>.json.
4. `/review-evaluation <id>`, then `/review-evaluation-final <id>` — first- and
   second-pass review.

## Caches

Both sit under scripts/, are gitignored, and can regenerate on demand.

- research-cache/<id>.json — per-property name, urls and summary. Written by
  /research-sources, read by research.
- .source-cache/<id>.json — fetched page text keyed by URL. Written by research,
  read by the review skills.

## How AI is used

This setup is unconvential as it uses both a Claude subscription and the Anthropic API with metered credits.

- Source discovery and review run as Claude Code skills (`/research-sources`,
  `/review-evaluation`) — they use Claude subscription, not metered API credits.
- `pnpm run research` calls the Anthropic API directly (needs
  `ANTHROPIC_API_KEY`) — one call per property, billed per token.

- **Why have the split?** skills do the open-ended research for free. The API
  has the citation feature that the subscription does not have
- Using the citation feature in the API means that every claim is backed by the exact text from a website
