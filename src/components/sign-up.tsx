"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/mini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRANDING_NAME_FA } from "@/const/branding";
import { authClient } from "@/lib/auth-client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

const signupSchema = z.object({
  firstName: z.string().check(z.minLength(3), z.maxLength(255)),
  lastName: z.string().check(z.minLength(3), z.maxLength(255)),
  email: z.email(),
  password: z.string().check(z.minLength(6), z.maxLength(255), z.trim()),
});

type SignUpFormType = z.infer<typeof signupSchema>;

export function SignUp() {
  const router = useRouter();
  const form = useForm<SignUpFormType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  async function onSubmit(values: SignUpFormType) {
    try {
      const res = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
      });
      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success(`لطفا ایمیل خود را برای فعالسازی اکانت چک کنید`);
        router.push("/");
      }
    } catch (err) {
      console.error(err);
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
            <h1 className="mb-1 font-semibold text-xl">
              ساخت اکانت {BRANDING_NAME_FA}
            </h1>
            <p className="text-sm">
              خوش آمدید! اکانت خودتون رو بسازید و وارد شوید
            </p>

            <div className="mt-4 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام</FormLabel>
                      <FormControl>
                        <Input placeholder="علی" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام خانوادگی</FormLabel>
                      <FormControl>
                        <Input placeholder="فهیم" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
              اکانت دارید؟
              <Button asChild variant="link" className="px-2">
                <Link href="/signin">ورود</Link>
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </section>
  );
}
