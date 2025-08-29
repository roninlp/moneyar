import { TransactionsClient } from "@/components/transactions-client";
import { getAccounts } from "@/lib/actions/accounts";
import { getTransactions } from "@/lib/actions/transactions";

export default async function TransactionsPage() {
  const transactionsPromise = getTransactions();
  const accountsPromise = getAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">تراکنش‌ها</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            درآمد و هزینه‌های خود را پیگیری کنید
          </p>
        </div>
      </div>

      <TransactionsClient
        transactionsPromise={transactionsPromise}
        accountsPromise={accountsPromise}
      />
    </div>
  );
}
