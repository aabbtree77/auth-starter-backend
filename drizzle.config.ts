import { defineConfig } from "drizzle-kit";

import * as dotenv from "dotenv";

dotenv.config();
const sqlitePath = process.env.sqlitePath;

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: sqlitePath!,
  },
  verbose: true,
  strict: true,
});
