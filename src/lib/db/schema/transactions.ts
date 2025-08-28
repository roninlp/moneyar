import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts";
import { user } from "./auth";

export const transactions = sqliteTable("transactions", {
  id: text().primaryKey(),
  amount: real().notNull(),
  description: text().notNull(),
  category: text({
    enum: [
      "food",
      "transportation",
      "entertainment",
      "shopping",
      "bills",
      "healthcare",
      "education",
      "salary",
      "investment",
      "transfer",
      "other",
    ],
  }).notNull(),
  type: text({
    enum: ["income", "expense"],
  }).notNull(),
  date: integer({ mode: "timestamp" }).notNull(),
  accountId: text()
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
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
