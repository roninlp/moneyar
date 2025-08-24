"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/accounts";
import { generateId } from "../utils";

const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum([
    "checking",
    "savings",
    "credit",
    "investment",
    "cash",
    "other",
  ]),
  balance: z.number().default(0),
  bank: z.string().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export async function createAccount(data: CreateAccountInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = createAccountSchema.parse(data);

    const accountId = generateId();

    const [account] = await db
      .insert(accounts)
      .values({
        id: accountId,
        name: validatedData.name,
        type: validatedData.type,
        balance: validatedData.balance,
        bank: validatedData.bank,
        userId: session.user.id,
      })
      .returning();

    revalidatePath("/accounts");
    return { success: true, data: { id: account.id } };
  } catch (error) {
    console.error("Error creating account:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data",
        details: error.message,
      };
    }
    return { success: false, error: "Failed to create account" };
  }
}

export async function getAccounts() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, session.user.id))
      .orderBy(accounts.createdAt);

    return { success: true, data: userAccounts };
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return { success: false, error: "Failed to fetch accounts" };
  }
}
