import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  dialect: "turso",

  schema: "./src/lib/db/schema/*",

  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
    authToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  },
});
