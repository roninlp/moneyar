"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRANDING_NAME } from "@/const/branding";
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
                Sign In to {BRANDING_NAME}
              </h1>
              <p className="text-sm">Welcome back! Sign in to continue</p>
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور</FormLabel>
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
                {form.formState.isSubmitting ? "در حال ثبت نام" : "ثبت نام"}
              </Button>
            </div>
          </div>

          <div className="rounded-(--radius) border bg-muted p-3">
            <p className="text-center text-accent-foreground text-sm">
              Don't have an account ?
              <Button asChild variant="link" className="px-2">
                <Link href="#">Create account</Link>
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </section>
  );
}
