"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
  initialTransactions: Transaction[];
  accounts: Account[];
}

export function TransactionsClient({
  initialTransactions,
  accounts,
}: TransactionsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null,
  );
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleDeleteTransaction = async (transactionId: string) => {
    startTransition(async () => {
      try {
        const result = await deleteTransaction(transactionId);
        if (result.success) {
          toast.success("Transaction deleted successfully!");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to delete transaction");
        }
      } catch {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Unknown Account";
  };

  const sortedTransactions = initialTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <>
      <div className="mb-8 flex justify-end">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm
              mode="create"
              onClose={() => {
                setShowAddDialog(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {sortedTransactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="font-medium text-lg">No transactions yet</h3>
              <p className="mt-2 text-muted-foreground">
                Get started by adding your first transaction
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedTransactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{transaction.description}</h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
                          transaction.type === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                      <span>{getAccountName(transaction.accountId)}</span>
                      <span>{transaction.category}</span>
                      <span>
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-medium text-lg ${
                        transaction.type === "income"
                          ? "text-green-600"
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
                        size="sm"
                        onClick={() => setEditTransaction(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        disabled={isPending}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editTransaction && (
            <TransactionForm
              mode="edit"
              initialData={editTransaction}
              onClose={() => {
                setEditTransaction(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
