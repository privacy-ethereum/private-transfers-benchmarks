# ekono-scraper

Daily price scraper and MCP server for **Tiendas Ekono Costa Rica** ([tiendasekono.com](https://www.tiendasekono.com)).

The scraper walks the site's sitemap, extracts each product (JSON-LD first, Open
Graph fallback), and stores a **delta-only** price history in SQLite — a new
snapshot is written only when a price or stock status actually changes. An MCP
server exposes the catalog read-only so an agent can query products and price
trends.

## Architecture

```
sitemap ──▶ discover ──▶ fetch (conditional GET) ──▶ extract ──▶ normalize ──▶ SQLite
                                                                                  │
                                                                       MCP server (read-only)
```

Two decoupled entry points:

- `src/run.ts` — one scrape pass (cron / GitHub Action). **Writes** the DB.
- `src/mcp/server.ts` — MCP stdio server. **Reads** the DB.

A scrape failure never takes the MCP down.

## Setup

```bash
pnpm install
cp .env.example .env   # adjust if needed
```

Requires Node >= 22.

## Usage

```bash
pnpm scrape            # run one daily scrape (dev, via tsx)
pnpm mcp               # run the MCP server over stdio (dev)

pnpm build             # compile to dist/
node --env-file=.env dist/run.js        # production scrape
node --env-file=.env dist/mcp/server.js # production MCP server

pnpm test              # extraction + delta-storage tests
pnpm typecheck
```

## MCP tools

| Tool | Input | Returns |
|------|-------|---------|
| `search_products` | `query`, `limit?` | matching active products + current price |
| `get_product` | `id` | product + variants + current prices |
| `get_price_history` | `id`, `from?`, `to?` | snapshot time series per variant |
| `list_price_drops` | `since`, `min_pct?` | products whose price fell, biggest first |
| `list_categories` | — | categories with active counts |
| `catalog_status` | — | counts + last run (stale-data canary) |

### Registering with Claude / an MCP client

```json
{
  "mcpServers": {
    "ekono": {
      "command": "node",
      "args": ["--env-file=/path/to/.env", "/path/to/ekono-scraper/dist/mcp/server.js"]
    }
  }
}
```

## Deployment notes

- **Network egress + crawl time** are the real budget, not disk. With delta
  storage the DB stays in the low hundreds of MB for years.
- Schedule `dist/run.js` nightly (cron / systemd timer / GitHub Action). It is
  idempotent — a same-day re-run writes nothing new.
- Conditional GET (ETag / Last-Modified) means unchanged pages cost a `304`.
- Be a good citizen: keep `CONCURRENCY` low, run off-peak, and keep a real
  contact in `USER_AGENT`. Check `robots.txt` and the site's terms first.

## Status / TODO

- [ ] Verify the live sitemap layout and product-page JSON-LD against real pages
      (blocked until network access to `tiendasekono.com` is available).
- [ ] Confirm whether an internal JSON listing endpoint exists (would replace
      HTML parsing and cut bandwidth ~20×).
- [ ] Add per-variant attribute extraction once real variant markup is known.
- [ ] Playwright fallback if any listing/detail pages are client-rendered.
