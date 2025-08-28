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
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl">Error</h1>
          <p className="text-muted-foreground">
            {transactionsResult.error || "Failed to load transactions"}
          </p>
        </div>
      </div>
    );
  }

  if (!accountsResult.success) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl">Error</h1>
          <p className="text-muted-foreground">
            {accountsResult.error || "Failed to load accounts"}
          </p>
        </div>
      </div>
    );
  }

  const transactions = transactionsResult.data || [];
  const accounts = accountsResult.data || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Transactions</h1>
          <p className="text-muted-foreground">
            Track your income and expenses
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading transactions...</div>}>
        <TransactionsClient
          initialTransactions={transactions}
          accounts={accounts}
        />
      </Suspense>
    </div>
  );
}
