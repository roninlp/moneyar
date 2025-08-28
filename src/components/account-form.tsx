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
import { createAccount, updateAccount } from "@/lib/actions/accounts";
import {
  ACCOUNT_TYPE_LABELS,
  type Account,
  type AccountFormData,
  accountFormSchema,
} from "@/lib/types/accounts";

interface AccountFormProps {
  mode?: "create" | "edit";
  initialData?: Account;
  onClose?: () => void;
}

export function AccountForm({
  mode = "create",
  initialData,
  onClose,
}: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      type: "checking",
      balance: "0",
      bank: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        name: initialData.name,
        type: initialData.type,
        balance: initialData.balance.toString(),
        bank: initialData.bank || "",
      });
    }
  }, [mode, initialData, form]);

  async function onSubmit(values: AccountFormData) {
    try {
      setIsSubmitting(true);
      const balance = parseFloat(values.balance) || 0;

      if (mode === "edit" && initialData) {
        const result = await updateAccount({
          id: initialData.id,
          ...values,
          balance,
        });

        if (result.success) {
          toast.success("حساب با موفقیت بروزرسانی شد!");
          onClose?.();
        } else {
          toast.error(result.error || "بروزرسانی حساب ناموفق بود");
        }
      } else {
        const result = await createAccount({
          ...values,
          balance,
        });

        if (result.success) {
          toast.success("حساب با موفقیت ایجاد شد!");
          form.reset();
          onClose?.();
        } else {
          toast.error(result.error || "ایجاد حساب ناموفق بود");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("خطای غیرمنتظره رخ داد");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                نام حساب
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="مثال: حساب چک اصلی"
                  className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                نوع حساب
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                    <SelectValue placeholder="نوع حساب را انتخاب کنید" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACCOUNT_TYPE_LABELS.map((type) => (
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
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                {mode === "edit" ? "موجودی فعلی" : "موجودی اولیه"}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bank"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                بانک (اختیاری)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="مثال: بانک ملی، بانک ملت"
                  className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
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
                ? "بروزرسانی حساب"
                : "ایجاد حساب"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
