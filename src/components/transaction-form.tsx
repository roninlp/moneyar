"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTransaction,
  updateTransaction,
} from "@/lib/actions/transactions";
import { getAccounts } from "@/lib/actions/accounts";
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_CATEGORY_LABELS,
  type Transaction,
  type TransactionFormData,
  transactionFormSchema,
} from "@/lib/types/transactions";
import type { Account } from "@/lib/types/accounts";

interface TransactionFormProps {
  mode?: "create" | "edit";
  initialData?: Transaction;
  onClose?: () => void;
}

export function TransactionForm({
  mode = "create",
  initialData,
  onClose,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: "",
      description: "",
      category: "other",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      accountId: "",
    },
  });

  useEffect(() => {
    async function loadAccounts() {
      const result = await getAccounts();
      if (result.success) {
        setAccounts(result.data || []);
      }
    }
    loadAccounts();
  }, []);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        amount: initialData.amount.toString(),
        description: initialData.description,
        category: initialData.category,
        type: initialData.type,
        date: new Date(initialData.date).toISOString().split("T")[0],
        accountId: initialData.accountId,
      });
    }
  }, [mode, initialData, form]);

  async function onSubmit(values: TransactionFormData) {
    try {
      setIsSubmitting(true);
      const amount = parseFloat(values.amount);
      const date = new Date(values.date);

      if (mode === "edit" && initialData) {
        const result = await updateTransaction({
          id: initialData.id,
          ...values,
          amount,
          date,
        });

        if (result.success) {
          toast.success("Transaction updated successfully!");
          onClose?.();
        } else {
          toast.error(result.error || "Failed to update transaction");
        }
      } else {
        const result = await createTransaction({
          ...values,
          amount,
          date,
        });

        if (result.success) {
          toast.success("Transaction created successfully!");
          form.reset();
          onClose?.();
        } else {
          toast.error(result.error || "Failed to create transaction");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRANSACTION_TYPE_LABELS.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Grocery shopping" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRANSACTION_CATEGORY_LABELS.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
                ? "Update Transaction"
                : "Create Transaction"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
