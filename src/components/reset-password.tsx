"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import {
  type ResetPasswordFormType,
  resetPasswordSchema,
} from "@/lib/types/auth.types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

export function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormType) {
    if (!token) {
      toast.error("توکن بازنشانی رمز عبور نامعتبر است");
      return;
    }

    if (values.password !== values.confirmPassword) {
      toast.error("رمز عبور و تایید آن باید یکسان باشند");
      return;
    }

    const data = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (data.error) {
      toast.error(data.error.message);
    } else {
      toast.success("رمز عبور با موفقیت بازنشانی شد");
      router.push("/signin");
    }
  }

  if (!token) {
    return (
      <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
        <div className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-8 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
          <h1 className="mb-4 font-semibold text-xl">لینک نامعتبر</h1>
          <p className="mb-4 text-sm">
            لینک بازنشانی رمز عبور نامعتبر است یا منقضی شده است.
          </p>
          <Button asChild className="w-full">
            <Link href="/forgot-password">درخواست لینک جدید</Link>
          </Button>
        </div>
      </section>
    );
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
                Reset Password
              </h1>
              <p className="text-sm">رمز عبور جدید خود را وارد کنید</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور جدید</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="********"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تایید رمز عبور</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="********"
                        type="password"
                        {...field}
                      />
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
                {form.formState.isSubmitting
                  ? "در حال بازنشانی..."
                  : "بازنشانی رمز عبور"}
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
