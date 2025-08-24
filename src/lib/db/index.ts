import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/env";
import * as authSchema from "./schema/auth";
import * as accountsSchema from "./schema/accounts";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle({
  client,
  casing: "snake_case",
  schema: {
    ...authSchema,
    ...accountsSchema,
  },
});
