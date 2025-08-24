import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const accounts = sqliteTable("accounts", {
  id: text().primaryKey(),
  name: text().notNull(),
  type: text("type", {
    enum: ["checking", "savings", "credit", "investment", "cash", "other"],
  }).notNull(),
  balance: real().notNull().default(0),
  bank: text(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});
