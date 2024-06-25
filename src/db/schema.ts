import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// SQLite does not have uuid and datetime types,
// but this is a micro-optimization problem.

export const userTable = sqliteTable("user", {
  id: text("id").primaryKey().notNull(),
  userName: text("user_name").notNull(),
  password: text("password").notNull(),
  userRole: text("user_role", {
    enum: ["admin", "teacher", "student", "nobody"],
  }).notNull(),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").primaryKey().notNull(),
  expiresAt: text("expires_at").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
});
