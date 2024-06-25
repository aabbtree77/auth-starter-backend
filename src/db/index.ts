import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

// Initialize the SQLite database
const db = new Database(process.env.sqlitePath);
//db.run("PRAGMA foreign_keys = ON;"); // Enable foreign key constraints
export const orm = drizzle(db);
