"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/accounts";
import {
  type CreateAccountInput,
  createAccountSchema,
  type UpdateAccountInput,
  updateAccountSchema,
} from "@/lib/types/accounts";
import { generateId } from "../utils";

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
    return { success: true, data: account };
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

export async function updateAccount(data: UpdateAccountInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = updateAccountSchema.parse(data);

    // First verify the account belongs to the user
    const [existingAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, validatedData.id))
      .limit(1);

    if (!existingAccount) {
      return { success: false, error: "Account not found" };
    }

    if (existingAccount.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [updatedAccount] = await db
      .update(accounts)
      .set({
        name: validatedData.name,
        type: validatedData.type,
        balance: validatedData.balance,
        bank: validatedData.bank,
      })
      .where(eq(accounts.id, validatedData.id))
      .returning();

    if (!updatedAccount) {
      return { success: false, error: "Account not found" };
    }

    revalidatePath("/accounts");
    return { success: true, data: updatedAccount };
  } catch (error) {
    console.error("Error updating account:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data",
        details: error.message,
      };
    }
    return { success: false, error: "Failed to update account" };
  }
}

export async function deleteAccount(accountId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // First verify the account belongs to the user
    const [existingAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);

    if (!existingAccount) {
      return { success: false, error: "Account not found" };
    }

    if (existingAccount.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [deletedAccount] = await db
      .delete(accounts)
      .where(eq(accounts.id, accountId))
      .returning();

    if (!deletedAccount) {
      return { success: false, error: "Account not found" };
    }

    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
