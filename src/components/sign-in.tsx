"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRANDING_NAME_FA } from "@/const/branding";
import { authClient } from "@/lib/auth-client";
import { type SignInFormType, signInSchema } from "@/lib/types/auth.types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

export function SignIn() {
  const router = useRouter();
  const form = useForm<SignInFormType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInFormType) {
    const data = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (data.error) {
      toast.error(data.error.message);
    } else {
      toast.success("با موفقیت وارد شدید");
      router.push("/");
    }
  }

  return (
    <section className="flex min-h-screen bg-gradient-primary px-4 py-16 md:py-32">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="m-auto h-fit w-full max-w-sm rounded-2xl border border-white/20 bg-white/80 p-0.5 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/80"
        >
          <div className="p-8 pb-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary-button">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="قفل امنیتی"
                >
                  <title>قفل امنیتی</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 bg-clip-text font-bold text-2xl">
                ورود به {BRANDING_NAME_FA}
              </h1>
              <p className="text-gray-600 text-sm dark:text-gray-400">
                خوش برگشتی! برای ادامه وارد شوید
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                      ایمیل
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@email.com"
                        className="rounded-xl border-gray-200 focus:border-primary-focus focus:ring-primary-focus"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                        رمز عبور
                      </FormLabel>
                      <Button
                        asChild
                        variant="link"
                        className="h-auto px-0 font-normal text-primary-focus hover:text-primary-focus/80"
                      >
                        <Link href="/forgot-password" className="text-sm">
                          فراموشی رمز عبور؟
                        </Link>
                      </Button>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="********"
                        type="password"
                        className="rounded-xl border-gray-200 focus:border-primary-focus focus:ring-primary-focus"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-primary-button py-3 font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "در حال ورود..."
                  : "ورود به حساب"}
              </Button>
            </div>
          </div>

          <div className="rounded-b-2xl border-gray-100 border-t bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/80">
            <p className="text-center text-gray-600 text-sm dark:text-gray-400">
              اکانت ندارید؟
              <Button
                asChild
                variant="link"
                className="px-2 font-medium text-primary-focus hover:text-primary-focus/80"
              >
                <Link href="/signup">ایجاد حساب</Link>
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </section>
  );
}
