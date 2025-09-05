"use client";

import { Calendar, CreditCard, Edit, Plus, Tag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { use, useOptimistic, useState } from "react";
import { DeleteTransactionDialog } from "@/components/delete-transaction-dialog";
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
import type { Account } from "@/lib/types/accounts";
import {
  TRANSACTION_CATEGORY_LABELS,
  type Transaction,
  type TransactionWithPendingState,
} from "@/lib/types/transactions";
import { cn } from "@/lib/utils";

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

type PendingTransaction = Transaction & {
  _pending?: "create" | "update" | "delete";
};

type OptimisticAction =
  | { type: "add"; transaction: PendingTransaction }
  | { type: "update"; transaction: PendingTransaction }
  | { type: "delete"; transactionId: string };

// Helper to convert between types
const toPendingState = (
  t: PendingTransaction,
): TransactionWithPendingState => ({
  ...t,
  isPending: Boolean(t._pending),
  pendingAction: t._pending,
});

const fromPendingState = (
  t: TransactionWithPendingState,
): PendingTransaction => {
  const { pendingAction, ...transaction } = t;
  return { ...transaction, _pending: pendingAction };
};

export function TransactionsClient({
  transactionsPromise,
  accountsPromise,
}: TransactionsClientProps) {
  const transactionsResult = use(transactionsPromise);
  const accountsResult = use(accountsPromise);

  const initialTransactions = transactionsResult.data || [];
  const accounts = accountsResult.data || [];

  const [optimisticTransactions, updateOptimistic] = useOptimistic(
    initialTransactions,
    (state: PendingTransaction[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [...state, action.transaction];
        case "update":
          return state.map((t) =>
            t.id === action.transaction.id ? action.transaction : t,
          );
        case "delete":
          return state.filter((t) => t.id !== action.transactionId);
        default:
          return state;
      }
    },
  );

  const [dialogState, setDialogState] = useState<{
    type: "add" | "edit" | "delete" | null;
    transaction?: PendingTransaction;
  }>({ type: null });

  // Create lookup maps for performance
  const accountMap = new Map(accounts.map((a: Account) => [a.id, a.name]));

  // Sort transactions by date (newest first) - cast to PendingTransaction for type safety
  const sortedTransactions = (
    [...optimisticTransactions] as PendingTransaction[]
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Optimistic handlers with type conversion
  const optimistic = {
    add: (transaction: TransactionWithPendingState) =>
      updateOptimistic({
        type: "add",
        transaction: fromPendingState(transaction),
      }),
    update: (transaction: TransactionWithPendingState) =>
      updateOptimistic({
        type: "update",
        transaction: fromPendingState(transaction),
      }),
    delete: (transactionId: string) =>
      updateOptimistic({ type: "delete", transactionId }),
  };

  // Dialog handlers
  const dialog = {
    open: (type: "add" | "edit" | "delete", transaction?: PendingTransaction) =>
      setDialogState({ type, transaction }),
    close: () => setDialogState({ type: null }),
  };

  // Helper functions
  const getAccountName = (id: string) =>
    accountMap.get(id) || "Unknown Account";
  const getCategoryLabel = (category: string) => {
    const categoryInfo = TRANSACTION_CATEGORY_LABELS.find(
      (c) => c.value === category,
    );
    return categoryInfo?.label || category;
  };

  // Error handling component
  const ErrorState = ({ error }: { error: string }) => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 text-6xl text-destructive">⚠️</div>
        <h1 className="mb-4 font-bold text-3xl text-foreground">خطا</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );

  if (!transactionsResult.success) {
    return (
      <ErrorState
        error={transactionsResult.error || "بارگذاری تراکنش‌ها ناموفق بود"}
      />
    );
  }

  if (!accountsResult.success) {
    return (
      <ErrorState
        error={accountsResult.error || "بارگذاری حساب‌ها ناموفق بود"}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">تراکنش‌ها</h1>
            <p className="mt-1 text-muted-foreground">
              درآمد و هزینه‌های خود را پیگیری کنید
            </p>
          </div>
        </div>
        <Dialog
          open={dialogState.type === "add"}
          onOpenChange={(open) => (open ? dialog.open("add") : dialog.close())}
        >
          <DialogTrigger asChild>
            <Button>
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
              onClose={dialog.close}
              onOptimisticAdd={optimistic.add}
            />
          </DialogContent>
        </Dialog>
      </div>

      {sortedTransactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <motion.div
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4, type: "spring" }}
                >
                  <Plus className="text-accent-foreground">
                    <title>افزودن تراکنش</title>
                  </Plus>
                </motion.div>
                <motion.h3
                  className="mb-2 font-semibold text-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  هنوز تراکنشی ندارید
                </motion.h3>
                <motion.p
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  با افزودن اولین تراکنش خود شروع کنید
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <Button onClick={() => dialog.open("add")}>
                    <Plus className="mr-2 h-5 w-5" />
                    افزودن تراکنش
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div className="space-y-3" layout>
            {sortedTransactions.map((transaction) => {
              const isDeleting = transaction._pending === "delete";
              const isPending = Boolean(transaction._pending);

              return (
                <motion.div
                  key={transaction.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{
                    opacity: isDeleting ? 0.5 : 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    layout: { duration: 0.3 },
                  }}
                  className={cn("group", isDeleting && "pointer-events-none")}
                >
                  <Card
                    className={cn(isPending && !isDeleting && "opacity-85")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Header Row */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-full",
                                  transaction.type === "income"
                                    ? "bg-chart-1/10 text-chart-1"
                                    : "bg-destructive/10 text-destructive",
                                )}
                              >
                                {transaction.type === "income" ? "↗" : "↙"}
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground text-lg leading-tight">
                                  {transaction.description}
                                </h3>
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs",
                                    transaction.type === "income"
                                      ? "bg-chart-1/10 text-chart-1"
                                      : "bg-destructive/10 text-destructive",
                                  )}
                                >
                                  {transaction.type === "income"
                                    ? "درآمد"
                                    : "هزینه"}
                                </span>
                              </div>
                            </div>
                            <div className="text-left">
                              <div
                                className={cn(
                                  "font-bold text-xl",
                                  transaction.type === "income"
                                    ? "text-chart-1"
                                    : "text-destructive",
                                )}
                              >
                                {transaction.type === "income" ? "+" : "-"}$
                                {transaction.amount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Details Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-muted-foreground text-sm">
                              <span className="flex items-center gap-1.5">
                                <CreditCard className="h-3.5 w-3.5" />
                                {getAccountName(transaction.accountId)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5" />
                                {getCategoryLabel(transaction.category)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(transaction.date).toLocaleDateString(
                                  "fa-IR",
                                )}
                              </span>
                            </div>
                            <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dialog.open("edit", transaction)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                disabled={isPending}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  dialog.open("delete", transaction)
                                }
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                disabled={isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Edit Transaction Dialog */}
      <Dialog
        open={dialogState.type === "edit"}
        onOpenChange={(open) => open || dialog.close()}
      >
        <DialogContent className="rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-xl">
              ویرایش تراکنش
            </DialogTitle>
          </DialogHeader>
          {dialogState.transaction && (
            <TransactionForm
              mode="edit"
              initialData={dialogState.transaction}
              accounts={accounts}
              onClose={dialog.close}
              onOptimisticUpdate={optimistic.update}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Dialog */}
      {dialogState.type === "delete" && dialogState.transaction && (
        <DeleteTransactionDialog
          isOpen={true}
          onClose={dialog.close}
          onSuccess={() => {}}
          onOptimisticDelete={optimistic.delete}
          onOptimisticUpdate={optimistic.update}
          transaction={toPendingState(dialogState.transaction)}
        />
      )}
    </div>
  );
}
