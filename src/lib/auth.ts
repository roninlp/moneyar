import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { VerificationEmail } from "@/components/emails/verification-email";
import { BRANDING_NAME } from "@/const/branding";
import { db } from "./db";
import { resend } from "./email";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ url, user }) => {
      const data = await resend.emails.send({
        from: "moneyar <no-reply@auth.roninlp.xyz>",
        to: [user.email],
        subject: "بازنشانی رمز عبور",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>بازنشانی رمز عبور</h2>
            <p>سلام ${user.email}،</p>
            <p>درخواست بازنشانی رمز عبور برای حساب کاربری شما دریافت شده است.</p>
            <p>برای بازنشانی رمز عبور خود، روی لینک زیر کلیک کنید:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #007cba; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">بازنشانی رمز عبور</a>
            <p>اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.</p>
            <p>این لینک تنها برای یک ساعت معتبر است.</p>
            <p>با تشکر،<br>تیم ${BRANDING_NAME}</p>
          </div>
        `,
      });
      console.log(data);
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
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
