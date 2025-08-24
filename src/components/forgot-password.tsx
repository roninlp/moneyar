"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { type ForgotPasswordFormType, forgotPasswordSchema } from "@/lib/types/auth.types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

export function ForgotPassword() {
  const form = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormType) {
    const data = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (data.error) {
      toast.error(data.error.message);
    } else {
      toast.success("ایمیل بازنشانی رمز عبور ارسال شد. ایمیل خود را بررسی کنید.");
    }
  }

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
        >
          <div className="p-8 pb-6">
            <div>
              <Link href="/" aria-label="go home">
                #home
              </Link>
              <h1 className="mt-4 mb-1 font-semibold text-xl">
                Forgot Password
              </h1>
              <p className="text-sm">رمز عبور خود را فراموش کرده‌اید؟ نگران نباشید</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل</FormLabel>
                    <FormControl>
                      <Input placeholder="alifahim@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "در حال ارسال..." : "ارسال ایمیل بازنشانی"}
              </Button>
            </div>
          </div>

          <div className="rounded-(--radius) border bg-muted p-3">
            <p className="text-center text-accent-foreground text-sm">
              Remember your password?
              <Button asChild variant="link" className="px-2">
                <Link href="/signin">Sign In</Link>
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </section>
  );
}
