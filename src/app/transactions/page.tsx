import { Suspense } from "react";
import { TransactionsClient } from "@/components/transactions-client";
import { getAccounts } from "@/lib/actions/accounts";
import { getTransactions } from "@/lib/actions/transactions";

export default async function TransactionsPage() {
  const [transactionsResult, accountsResult] = await Promise.all([
    getTransactions(),
    getAccounts(),
  ]);

  if (!transactionsResult.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-red-950 dark:via-pink-950 dark:to-rose-950">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h1 className="mb-4 font-bold text-3xl text-gray-900 dark:text-gray-100">
            خطا
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {transactionsResult.error || "بارگذاری تراکنش‌ها ناموفق بود"}
          </p>
        </div>
      </div>
    );
  }

  if (!accountsResult.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-red-950 dark:via-pink-950 dark:to-rose-950">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h1 className="mb-4 font-bold text-3xl text-gray-900 dark:text-gray-100">
            خطا
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {accountsResult.error || "بارگذاری حساب‌ها ناموفق بود"}
          </p>
        </div>
      </div>
    );
  }

  const transactions = transactionsResult.data || [];
  const accounts = accountsResult.data || [];

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">تراکنش‌ها</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              درآمد و هزینه‌های خود را پیگیری کنید
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-orange-500 border-b-2"></div>
            </div>
          }
        >
          <TransactionsClient
            initialTransactions={transactions}
            accounts={accounts}
          />
        </Suspense>
      </div>
    </div>
  );
}
