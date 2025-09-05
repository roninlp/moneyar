"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteTransaction } from "@/lib/actions/transactions";
import type { TransactionWithPendingState } from "@/lib/types/transactions";

interface DeleteTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOptimisticDelete?: (transactionId: string) => void;
  onOptimisticUpdate?: (transaction: TransactionWithPendingState) => void;
  transaction: Pick<
    TransactionWithPendingState,
    "id" | "description" | "amount"
  >;
}

export function DeleteTransactionDialog({
  isOpen,
  onClose,
  onSuccess,
  onOptimisticDelete,
  onOptimisticUpdate,
  transaction,
}: DeleteTransactionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    try {
      setIsDeleting(true);

      // Mark as pending first
      onOptimisticUpdate?.({
        ...transaction,
        isPending: true,
        pendingAction: "delete",
      } as TransactionWithPendingState);

      // Close dialog immediately for better UX
      onClose();

      const result = await deleteTransaction(transaction.id);

      if (result.success) {
        // Now actually remove from UI
        onOptimisticDelete?.(transaction.id);
        toast.success("تراکنش با موفقیت حذف شد!");
        onSuccess?.();
      } else {
        toast.error(result.error || "حذف تراکنش ناموفق بود");
        // Revert pending state
        onOptimisticUpdate?.({
          ...transaction,
          isPending: false,
          pendingAction: undefined,
        } as TransactionWithPendingState);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("خطای غیرمنتظره رخ داد");
      // Revert pending state
      onOptimisticUpdate?.({
        ...transaction,
        isPending: false,
        pendingAction: undefined,
      } as TransactionWithPendingState);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-red-600 text-xl dark:text-red-400">
            حذف تراکنش
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-label="هشدار"
              >
                <title>هشدار</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="mb-2 font-medium text-gray-900 dark:text-gray-100">
              آیا مطمئن هستید که می‌خواهید این تراکنش را حذف کنید؟
            </p>
            <p className="mb-2 text-gray-600 text-sm dark:text-gray-400">
              <strong>توضیحات:</strong> {transaction.description}
            </p>
            <p className="mb-2 text-gray-600 text-sm dark:text-gray-400">
              <strong>مبلغ:</strong> {transaction.amount.toLocaleString()} تومان
            </p>
            <p className="text-gray-600 text-sm dark:text-gray-400">
              این عمل قابل برگشت نیست.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl"
          >
            لغو
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl"
          >
            {isDeleting ? "در حال حذف..." : "حذف تراکنش"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
