/**
 * Minimal logger that writes to **stderr** only.
 *
 * The MCP server speaks JSON-RPC over stdout, so nothing else may touch stdout
 * or the protocol stream gets corrupted. Always log through here.
 */

const write = (level: string, message: string): void => {
  process.stderr.write(`[${new Date().toISOString()}] ${level} ${message}\n`);
};

export const logger = {
  info: (message: string): void => write("INFO", message),
  warn: (message: string): void => write("WARN", message),
  error: (message: string): void => write("ERROR", message),
};
