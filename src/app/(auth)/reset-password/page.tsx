import { Suspense } from "react";
import { ResetPassword } from "@/components/reset-password";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
