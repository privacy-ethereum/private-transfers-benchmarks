import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "../config.js";
import { openDb } from "../store/db.js";
import { registerTools } from "./tools.js";
import { logger } from "../utils/logger.js";

/** MCP stdio server exposing read-only access to the scraped catalog. */
const main = async (): Promise<void> => {
  const db = openDb(config.dbPath);
  const server = new McpServer({ name: "ekono-scraper", version: "0.1.0" });
  registerTools(server, db);

  await server.connect(new StdioServerTransport());
  logger.info("ekono MCP server ready (stdio)");
};

main().catch((err) => {
  logger.error(`fatal: ${(err as Error).stack ?? err}`);
  process.exit(1);
});
