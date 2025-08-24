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
          toast.success("Account updated successfully!");
          onClose?.();
        } else {
          toast.error(result.error || "Failed to update account");
        }
      } else {
        const result = await createAccount({
          ...values,
          balance,
        });

        if (result.success) {
          toast.success("Account created successfully!");
          form.reset();
          onClose?.();
        } else {
          toast.error(result.error || "Failed to create account");
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Main Checking" {...field} />
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
              <FormLabel>Account Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
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
              <FormLabel>
                {mode === "edit" ? "Current Balance" : "Initial Balance"}
              </FormLabel>
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
          name="bank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chase, Wells Fargo" {...field} />
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
                ? "Update Account"
                : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
