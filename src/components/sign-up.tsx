"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRANDING_NAME } from "@/const/branding";

export function SignUp() {
  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        action=""
        className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home">
              #home
            </Link>
            <h1 className="mt-4 mb-1 font-semibold text-xl">
              Create a {BRANDING_NAME}Account
            </h1>
            <p className="text-sm">Welcome! Create an account to get started</p>
          </div>

          <div className="mt-4 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="block text-sm">
                  Firstname
                </Label>
                <Input type="text" required name="firstname" id="firstname" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="block text-sm">
                  Lastname
                </Label>
                <Input type="text" required name="lastname" id="lastname" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Username
              </Label>
              <Input type="email" required name="email" id="email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pwd" className="text-sm">
                Password
              </Label>
              <Input
                type="password"
                required
                name="pwd"
                id="pwd"
                className="input sz-md variant-mixed"
              />
            </div>

            <Button className="w-full">Continue</Button>
          </div>
        </div>

        <div className="rounded-(--radius) border bg-muted p-3">
          <p className="text-center text-accent-foreground text-sm">
            Have an account ?
            <Button asChild variant="link" className="px-2">
              <Link href="/signin">Sign In</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
