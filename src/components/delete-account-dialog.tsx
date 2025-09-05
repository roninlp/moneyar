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
import { deleteAccount } from "@/lib/actions/accounts";
import type { AccountWithPendingState } from "@/lib/types/accounts";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOptimisticDelete?: (accountId: string) => void;
  onOptimisticUpdate?: (account: AccountWithPendingState) => void;
  account: Pick<AccountWithPendingState, "id" | "name">;
}

export function DeleteAccountDialog({
  isOpen,
  onClose,
  onSuccess,
  onOptimisticDelete,
  onOptimisticUpdate,
  account,
}: DeleteAccountDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    try {
      setIsDeleting(true);

      // Mark as pending first
      onOptimisticUpdate?.({
        ...account,
        isPending: true,
        pendingAction: "delete",
      } as AccountWithPendingState);

      // Close dialog immediately for better UX
      onClose();

      const result = await deleteAccount(account.id);

      if (result.success) {
        // Now actually remove from UI
        onOptimisticDelete?.(account.id);
        toast.success("حساب با موفقیت حذف شد!");
        onSuccess?.();
      } else {
        toast.error(result.error || "حذف حساب ناموفق بود");
        // Revert pending state
        onOptimisticUpdate?.({
          ...account,
          isPending: false,
          pendingAction: undefined,
        } as AccountWithPendingState);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("خطای غیرمنتظره رخ داد");
      // Revert pending state
      onOptimisticUpdate?.({
        ...account,
        isPending: false,
        pendingAction: undefined,
      } as AccountWithPendingState);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-red-600 text-xl dark:text-red-400">
            حذف حساب
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
              آیا مطمئن هستید که می‌خواهید حساب "{account.name}" را حذف کنید؟
            </p>
            <p className="text-gray-600 text-sm dark:text-gray-400">
              این عمل قابل برگشت نیست و تمام اطلاعات مربوط به این حساب حذف خواهد
              شد.
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
            {isDeleting ? "در حال حذف..." : "حذف حساب"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
