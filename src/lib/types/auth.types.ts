import { z } from "zod/mini";

export const signupSchema = z.object({
  firstName: z.string().check(z.minLength(3), z.maxLength(255)),
  lastName: z.string().check(z.minLength(3), z.maxLength(255)),
  email: z.email(),
  password: z.string().check(z.minLength(6), z.maxLength(255), z.trim()),
});

export type SignUpFormType = z.infer<typeof signupSchema>;

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().check(z.minLength(6), z.maxLength(255), z.trim()),
});

export type SignInFormType = z.infer<typeof signInSchema>;
