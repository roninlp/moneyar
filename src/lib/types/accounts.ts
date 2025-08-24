import { z } from "zod";
import type { accounts } from "@/lib/db/schema/accounts";

export const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "credit",
  "investment",
  "cash",
  "other",
] as const;

export const ACCOUNT_TYPE_LABELS = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit", label: "Credit" },
  { value: "investment", label: "Investment" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export type Account = typeof accounts.$inferSelect;

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(ACCOUNT_TYPES),
  balance: z.number().default(0),
  bank: z.string().optional(),
});

export const updateAccountSchema = createAccountSchema.extend({
  id: z.string(),
});

export const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(ACCOUNT_TYPES),
  balance: z.string(),
  bank: z.string().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountFormData = z.infer<typeof accountFormSchema>;
