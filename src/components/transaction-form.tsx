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
import type { Account } from "@/lib/types/accounts";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_TYPE_LABELS,
  type Transaction,
  type TransactionFormData,
  type TransactionWithPendingState,
  transactionFormSchema,
} from "@/lib/types/transactions";

interface TransactionFormProps {
  mode?: "create" | "edit";
  initialData?: Transaction;
  accounts: Account[];
  onClose?: () => void;
  onSuccess?: () => void;
  onOptimisticAdd?: (transaction: TransactionWithPendingState) => void;
  onOptimisticUpdate?: (transaction: TransactionWithPendingState) => void;
}

export function TransactionForm({
  mode = "create",
  initialData,
  accounts,
  onClose,
  onSuccess,
  onOptimisticAdd,
  onOptimisticUpdate,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Reset form when mode or initialData changes
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
    } else if (mode === "create") {
      form.reset({
        amount: "",
        description: "",
        category: "other",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        accountId: "",
      });
    }
  }, [mode, initialData, form]);

  async function onSubmit(values: TransactionFormData) {
    try {
      setIsSubmitting(true);
      const amount = parseFloat(values.amount);
      const date = new Date(values.date);

      if (mode === "edit" && initialData) {
        // Create optimistic transaction for update
        const optimisticTransaction: TransactionWithPendingState = {
          ...initialData,
          amount,
          description: values.description,
          category: values.category,
          type: values.type,
          date,
          accountId: values.accountId,
          updatedAt: new Date(),
          isPending: true,
          pendingAction: "update",
        };

        // Optimistic update with pending state
        onOptimisticUpdate?.(optimisticTransaction);

        // Close dialog immediately for better UX
        onClose?.();

        const result = await updateTransaction({
          id: initialData.id,
          ...values,
          amount,
          date,
        });

        if (result.success) {
          // Clear pending state with updated data
          onOptimisticUpdate?.({
            ...optimisticTransaction,
            isPending: false,
            pendingAction: undefined,
          });
          toast.success("تراکنش با موفقیت بروزرسانی شد!");
          onSuccess?.();
        } else {
          toast.error(result.error || "بروزرسانی تراکنش ناموفق بود");
          // Revert to original data without pending state
          onOptimisticUpdate?.({
            ...initialData,
            isPending: false,
            pendingAction: undefined,
          });
        }
      } else {
        // Create optimistic transaction for immediate UI update
        const optimisticTransaction: TransactionWithPendingState = {
          id: `temp-${Date.now()}`, // Temporary ID
          amount,
          description: values.description,
          category: values.category,
          type: values.type,
          date,
          accountId: values.accountId,
          userId: "current-user", // Will be replaced by server
          createdAt: new Date(),
          updatedAt: new Date(),
          isPending: true,
          pendingAction: "create",
        };

        // Optimistic add with pending state
        onOptimisticAdd?.(optimisticTransaction);

        // Close dialog immediately and reset form for better UX
        form.reset();
        onClose?.();

        const result = await createTransaction({
          ...values,
          amount,
          date,
        });

        if (result.success && result.data) {
          // Replace optimistic transaction with real data
          onOptimisticUpdate?.({
            ...optimisticTransaction,
            id: result.data.id,
            isPending: false,
            pendingAction: undefined,
          });
          toast.success("تراکنش با موفقیت ایجاد شد!");
          onSuccess?.();
        } else {
          toast.error(result.error || "ایجاد تراکنش ناموفق بود");
          // Remove the optimistic transaction on failure
          // Note: This would need a proper revert mechanism in the client
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("خطای غیرمنتظره رخ داد");

      if (mode === "edit" && initialData) {
        // Revert to original state on error
        onOptimisticUpdate?.({
          ...initialData,
          isPending: false,
          pendingAction: undefined,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                نوع تراکنش
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20">
                    <SelectValue placeholder="نوع تراکنش را انتخاب کنید" />
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
              <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                مبلغ
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
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
              <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                توضیحات
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="مثال: خرید مواد غذایی"
                  className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                  {...field}
                />
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
              <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                دسته‌بندی
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20">
                    <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
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
              <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                حساب
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20">
                    <SelectValue placeholder="حساب را انتخاب کنید" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account: Account) => (
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
              <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                تاریخ
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 space-x-reverse">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border-gray-200 hover:bg-gray-50"
          >
            لغو
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gradient-primary-button px-6 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            {isSubmitting
              ? mode === "edit"
                ? "در حال بروزرسانی..."
                : "در حال ایجاد..."
              : mode === "edit"
                ? "بروزرسانی تراکنش"
                : "ایجاد تراکنش"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
