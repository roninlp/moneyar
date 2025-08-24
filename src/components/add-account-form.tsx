"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createAccount, type CreateAccountInput } from "@/lib/actions/accounts";
import { z } from "zod";
import { useState } from "react";

const addAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["checking", "savings", "credit", "investment", "cash", "other"]),
  balance: z.number().min(0, "Balance must be 0 or greater").default(0),
  bank: z.string().optional(),
});

type AddAccountFormType = z.infer<typeof addAccountSchema>;

const accountTypes = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit", label: "Credit" },
  { value: "investment", label: "Investment" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
] as const;

export function AddAccountForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddAccountFormType>({
    resolver: zodResolver(addAccountSchema),
    defaultValues: {
      name: "",
      type: "checking",
      balance: 0,
      bank: "",
    },
  });

  async function onSubmit(values: AddAccountFormType) {
    try {
      setIsSubmitting(true);
      const result = await createAccount(values);
      
      if (result.success) {
        toast.success("Account created successfully!");
        form.reset();
        // Close dialog by dispatching a custom event
        window.dispatchEvent(new CustomEvent("close-dialog"));
      } else {
        toast.error(result.error || "Failed to create account");
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
                <Input 
                  placeholder="e.g., Main Checking"
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
              <FormLabel>Account Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accountTypes.map((type) => (
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
              <FormLabel>Initial Balance</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                <Input 
                  placeholder="e.g., Chase, Wells Fargo"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.dispatchEvent(new CustomEvent("close-dialog"))}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
