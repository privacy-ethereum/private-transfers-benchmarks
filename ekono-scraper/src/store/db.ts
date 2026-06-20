import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { SCHEMA } from "./schema.js";

export type DB = Database.Database;

/** Open (creating parent dirs as needed) and migrate the SQLite database. */
export const openDb = (path: string): DB => {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.exec(SCHEMA);
  return db;
};
