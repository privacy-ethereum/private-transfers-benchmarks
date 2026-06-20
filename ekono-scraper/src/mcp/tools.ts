import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DB } from "../store/db.js";
import {
  catalogStatus,
  getPriceHistory,
  getProduct,
  listCategories,
  listPriceDrops,
  searchProducts,
} from "../store/repository.js";

const json = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] });

/** Register the read-only MCP tool surface over the scraped catalog. */
export const registerTools = (server: McpServer, db: DB): void => {
  server.registerTool(
    "search_products",
    {
      description: "Search active products by name. Returns id, name, brand, category and current price (CRC).",
      inputSchema: {
        query: z.string().describe("Text to match against product names"),
        limit: z.number().int().positive().max(100).optional().describe("Max results (default 20)"),
      },
    },
    async ({ query, limit }) => json(searchProducts(db, query, limit ?? 20)),
  );

  server.registerTool(
    "get_product",
    {
      description: "Get a single product with its variants and current prices.",
      inputSchema: { id: z.string().describe("Product id, e.g. 5010348") },
    },
    async ({ id }) => {
      const product = getProduct(db, id);
      return product ? json(product) : json({ error: `product ${id} not found` });
    },
  );

  server.registerTool(
    "get_price_history",
    {
      description: "Get the price snapshot time series for a product (one entry per change, per variant).",
      inputSchema: {
        id: z.string().describe("Product id"),
        from: z.string().optional().describe("ISO start date (inclusive), e.g. 2026-01-01"),
        to: z.string().optional().describe("ISO end date (inclusive)"),
      },
    },
    async ({ id, from, to }) => json(getPriceHistory(db, id, from, to)),
  );

  server.registerTool(
    "list_price_drops",
    {
      description: "List products whose current price dropped since a given date, biggest drop first.",
      inputSchema: {
        since: z.string().describe("ISO baseline date, e.g. 2026-06-01"),
        min_pct: z.number().min(0).max(100).optional().describe("Minimum drop percentage (default 0)"),
      },
    },
    async ({ since, min_pct }) => json(listPriceDrops(db, since, min_pct ?? 0)),
  );

  server.registerTool(
    "list_categories",
    { description: "List product categories with active product counts.", inputSchema: {} },
    async () => json(listCategories(db)),
  );

  server.registerTool(
    "catalog_status",
    {
      description: "Catalog health: product counts, snapshot count, and the last scrape run (use to detect stale data).",
      inputSchema: {},
    },
    async () => json(catalogStatus(db)),
  );
};
