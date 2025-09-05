import { z } from "zod";
import type { transactions } from "@/lib/db/schema/transactions";

export const TRANSACTION_TYPES = ["income", "expense"] as const;
export const TRANSACTION_CATEGORIES = [
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
] as const;

export const TRANSACTION_TYPE_LABELS = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
] as const;

export const TRANSACTION_CATEGORY_LABELS = [
  { value: "food", label: "Food & Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "bills", label: "Bills & Utilities" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "salary", label: "Salary" },
  { value: "investment", label: "Investment" },
  { value: "transfer", label: "Transfer" },
  { value: "other", label: "Other" },
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export type Transaction = typeof transactions.$inferSelect;

export type TransactionWithPendingState = Transaction & {
  isPending?: boolean;
  pendingAction?: "create" | "update" | "delete";
};

export const createTransactionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(TRANSACTION_CATEGORIES),
  type: z.enum(TRANSACTION_TYPES),
  date: z.date(),
  accountId: z.string().min(1, "Account is required"),
});

export const updateTransactionSchema = createTransactionSchema.extend({
  id: z.string(),
});

export const transactionFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(TRANSACTION_CATEGORIES),
  type: z.enum(TRANSACTION_TYPES),
  date: z.string().min(1, "Date is required"),
  accountId: z.string().min(1, "Account is required"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFormData = z.infer<typeof transactionFormSchema>;
