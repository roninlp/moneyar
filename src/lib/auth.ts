import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { VerificationEmail } from "@/components/emails/verification-email";
import { db } from "./db";
import { resend } from "./email";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ url, user }) => {
      const data = await resend.emails.send({
        from: "moneyar <no-reply@auth.roninlp.xyz>",
        to: [user.email],
        subject: "ایمیل خود را تایید کنید",
        react: VerificationEmail({
          userName: user.email,
          verificationCode: url,
        }),
      });
      console.log(data);
    },
    sendOnSignUp: true,
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  plugins: [username()],
});
