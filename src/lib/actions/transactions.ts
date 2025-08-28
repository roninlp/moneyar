"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/accounts";
import { transactions } from "@/lib/db/schema/transactions";
import {
  type CreateTransactionInput,
  createTransactionSchema,
  type UpdateTransactionInput,
  updateTransactionSchema,
} from "@/lib/types/transactions";
import { generateId } from "../utils";

export async function createTransaction(data: CreateTransactionInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = createTransactionSchema.parse(data);

    // Verify the account belongs to the user
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.id, validatedData.accountId),
          eq(accounts.userId, session.user.id),
        ),
      );

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    const transactionId = generateId();

    // Calculate the amount to add/subtract from balance
    const balanceChange =
      validatedData.type === "income"
        ? validatedData.amount
        : -validatedData.amount;

    // Create transaction and update account balance in a transaction
    await db.transaction(async (tx) => {
      await tx.insert(transactions).values({
        id: transactionId,
        amount: validatedData.amount,
        description: validatedData.description,
        category: validatedData.category,
        type: validatedData.type,
        date: validatedData.date,
        accountId: validatedData.accountId,
        userId: session.user.id,
      });

      await tx
        .update(accounts)
        .set({
          balance: account.balance + balanceChange,
        })
        .where(eq(accounts.id, validatedData.accountId));
    });

    revalidatePath("/accounts");
    revalidatePath("/transactions");
    return { success: true, data: { id: transactionId } };
  } catch (error) {
    console.error("Error creating transaction:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data",
        details: error.message,
      };
    }
    return { success: false, error: "Failed to create transaction" };
  }
}

export async function getTransactions(accountId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const whereCondition = accountId
      ? and(
          eq(transactions.userId, session.user.id),
          eq(transactions.accountId, accountId),
        )
      : eq(transactions.userId, session.user.id);

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(whereCondition)
      .orderBy(transactions.date);

    return { success: true, data: userTransactions };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error: "Failed to fetch transactions" };
  }
}

export async function updateTransaction(data: UpdateTransactionInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = updateTransactionSchema.parse(data);

    // Get the existing transaction
    const [existingTransaction] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, validatedData.id),
          eq(transactions.userId, session.user.id),
        ),
      );

    if (!existingTransaction) {
      return { success: false, error: "Transaction not found" };
    }

    // Get the account
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.id, existingTransaction.accountId),
          eq(accounts.userId, session.user.id),
        ),
      );

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Calculate balance changes
    const oldBalanceChange =
      existingTransaction.type === "income"
        ? existingTransaction.amount
        : -existingTransaction.amount;

    const newBalanceChange =
      validatedData.type === "income"
        ? validatedData.amount
        : -validatedData.amount;

    const balanceAdjustment = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    await db.transaction(async (tx) => {
      await tx
        .update(transactions)
        .set({
          amount: validatedData.amount,
          description: validatedData.description,
          category: validatedData.category,
          type: validatedData.type,
          date: validatedData.date,
        })
        .where(eq(transactions.id, validatedData.id));

      await tx
        .update(accounts)
        .set({
          balance: account.balance + balanceAdjustment,
        })
        .where(eq(accounts.id, existingTransaction.accountId));
    });

    revalidatePath("/accounts");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data",
        details: error.message,
      };
    }
    return { success: false, error: "Failed to update transaction" };
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the transaction to calculate balance adjustment
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, session.user.id),
        ),
      );

    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    // Get the account
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.id, transaction.accountId),
          eq(accounts.userId, session.user.id),
        ),
      );

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Calculate balance adjustment (reverse the transaction)
    const balanceAdjustment =
      transaction.type === "income" ? -transaction.amount : transaction.amount;

    // Delete transaction and update account balance in a transaction
    await db.transaction(async (tx) => {
      await tx.delete(transactions).where(eq(transactions.id, transactionId));

      await tx
        .update(accounts)
        .set({
          balance: account.balance + balanceAdjustment,
        })
        .where(eq(accounts.id, transaction.accountId));
    });

    revalidatePath("/accounts");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}
