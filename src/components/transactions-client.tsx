"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import {
  use,
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { TransactionForm } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteTransaction } from "@/lib/actions/transactions";
import type { Account } from "@/lib/types/accounts";
import type { Transaction } from "@/lib/types/transactions";

interface TransactionsClientProps {
  transactionsPromise: Promise<{
    success: boolean;
    error?: string;
    data?: Transaction[];
  }>;
  accountsPromise: Promise<{
    success: boolean;
    error?: string;
    data?: Account[];
  }>;
}

export function TransactionsClient({
  transactionsPromise,
  accountsPromise,
}: TransactionsClientProps) {
  const [isPending, startTransition] = useTransition();
  const transactionsResult = use(transactionsPromise);
  const accountsResult = use(accountsPromise);

  const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(
    transactionsResult.success ? transactionsResult.data || [] : [],
    (
      state,
      action: { type: "add" | "update" | "delete"; transaction: Transaction },
    ) => {
      switch (action.type) {
        case "add":
          return [...state, action.transaction];
        case "update":
          return state.map((transaction) =>
            transaction.id === action.transaction.id
              ? action.transaction
              : transaction,
          );
        case "delete":
          return state.filter(
            (transaction) => transaction.id !== action.transaction.id,
          );
        default:
          return state;
      }
    },
  );

  const accounts = accountsResult.success ? accountsResult.data || [] : [];

  // State for dialogs
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null,
  );
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Create memoized account lookup map for better performance
  const accountMap = useMemo(() => {
    return new Map(accounts.map((account: Account) => [account.id, account]));
  }, [accounts]);

  // Memoized sorted transactions
  const sortedTransactions = useMemo(() => {
    return [...optimisticTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [optimisticTransactions]);

  // Memoized account name getter
  const getAccountName = useCallback(
    (accountId: string) => {
      const account = accountMap.get(accountId);
      return account ? account.name : "Unknown Account";
    },
    [accountMap],
  );

  // Optimistic delete handler
  const handleDeleteTransaction = useCallback(
    async (transaction: Transaction) => {
      // Add optimistic update
      addOptimisticTransaction({ type: "delete", transaction });

      startTransition(async () => {
        try {
          const result = await deleteTransaction(transaction.id);
          if (!result.success) {
            toast.error(result.error || "حذف تراکنش ناموفق بود");
          } else {
            toast.success("تراکنش با موفقیت حذف شد!");
          }
        } catch {
          toast.error("خطای غیرمنتظره رخ داد");
        }
      });
    },
    [addOptimisticTransaction],
  );

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

  return (
    <>
      <div className="mb-8 flex justify-end">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-gradient-primary-button px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl">
              <Plus className="mr-2 h-5 w-5" />
              افزودن تراکنش
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-center font-bold text-xl">
                افزودن تراکنش جدید
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              mode="create"
              accounts={accounts}
              onSuccess={() => setShowAddDialog(false)}
              onOptimisticAdd={addOptimisticTransaction}
            />
          </DialogContent>
        </Dialog>
      </div>

      {sortedTransactions.length === 0 ? (
        <Card className="">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20">
                <svg
                  className="h-8 w-8 text-primary-focus"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="افزودن تراکنش"
                >
                  <title>افزودن تراکنش</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 text-xl dark:text-gray-100">
                هنوز تراکنشی ندارید
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                با افزودن اولین تراکنش خود شروع کنید
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 font-medium text-white hover:from-orange-600 hover:to-amber-600"
              >
                <Plus className="mr-2 h-5 w-5" />
                افزودن تراکنش
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedTransactions.map((transaction) => (
            <Card key={transaction.id} className="">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                        {transaction.description}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 font-medium text-xs ${
                          transaction.type === "income"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        }`}
                      >
                        {transaction.type === "income" ? "درآمد" : "هزینه"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 text-sm dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          role="img"
                          aria-label="حساب"
                        >
                          <title>حساب</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        {getAccountName(transaction.accountId)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          role="img"
                          aria-label="دسته‌بندی"
                        >
                          <title>دسته‌بندی</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        {transaction.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          role="img"
                          aria-label="تاریخ"
                        >
                          <title>تاریخ</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(transaction.date).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-bold text-xl ${
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {transaction.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditTransaction(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteTransaction(transaction)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Transaction Dialog */}
      <Dialog
        open={!!editTransaction}
        onOpenChange={() => setEditTransaction(null)}
      >
        <DialogContent className="rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-xl">
              ویرایش تراکنش
            </DialogTitle>
          </DialogHeader>
          {editTransaction && (
            <TransactionForm
              mode="edit"
              initialData={editTransaction}
              accounts={accounts}
              onSuccess={() => setEditTransaction(null)}
              onOptimisticUpdate={addOptimisticTransaction}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
