import { TransactionsClient } from "@/components/transactions-client";
import { getAccounts } from "@/lib/actions/accounts";
import { getTransactions } from "@/lib/actions/transactions";

export default async function TransactionsPage() {
  const transactionsPromise = getTransactions();
  const accountsPromise = getAccounts();

  return (
    <TransactionsClient
      transactionsPromise={transactionsPromise}
      accountsPromise={accountsPromise}
    />
  );
}
