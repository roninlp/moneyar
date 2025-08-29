"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRANDING_NAME_FA } from "@/const/branding";
import { authClient } from "@/lib/auth-client";
import { type SignUpFormType, signupSchema } from "@/lib/types/auth.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

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
    <section className="flex min-h-screen bg-background px-4 py-16 md:py-32">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="m-auto"
          // className="m-auto h-fit w-full max-w-md rounded-2xl border border-white/20 bg-white/80 p-0.5 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/80"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary-button">
                <UserPlus2 />
              </div>
              <CardTitle className="mb-2 bg-clip-text font-bold text-2xl">
                ساخت اکانت {BRANDING_NAME_FA}
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm dark:text-gray-400">
                خوش آمدید! اکانت خودتون رو بسازید و وارد شوید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                        نام
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="علی"
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                        نام خانوادگی
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="فهیم"
                          className="rounded-xl border-gray-200 focus:border-primary-focus focus:ring-primary-focus"
                          {...field}
                        />
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
                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                      رمز عبور
                    </FormLabel>
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
            </CardContent>

            <CardFooter className="flex w-full flex-col gap-4">
              <Button
                type="submit"
                className="w-full py-3 font-medium"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "در حال ثبت نام..."
                  : "ایجاد حساب"}
              </Button>
              <p className="text-center text-gray-600 text-sm dark:text-gray-400">
                اکانت دارید؟
                <Button
                  asChild
                  variant="link"
                  className="px-2 font-medium text-primary hover:text-primary/80"
                >
                  <Link href="/signin">ورود به حساب</Link>
                </Button>
              </p>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </section>
  );
}
