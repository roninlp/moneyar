"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import {
  startTransition,
  use,
  useCallback,
  useMemo,
  useOptimistic,
  useState,
} from "react";
import { AccountForm } from "@/components/account-form";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Account, AccountWithPendingState } from "@/lib/types/accounts";
import { Badge } from "./ui/badge";

interface AccountsClientProps {
  accountsPromise: Promise<{
    success: boolean;
    error?: string;
    data?: Account[];
  }>;
}

type OptimisticAction =
  | { type: "add"; account: AccountWithPendingState }
  | { type: "update"; account: AccountWithPendingState }
  | { type: "delete"; accountId: string };

export function AccountsClient({ accountsPromise }: AccountsClientProps) {
  const result = use(accountsPromise);

  // Transform Account[] to AccountWithPendingState[]
  const initialAccounts: AccountWithPendingState[] = useMemo(() => {
    if (!result.success || !result.data) return [];
    return result.data.map((account) => ({
      ...account,
      isPending: false,
      pendingAction: undefined,
    }));
  }, [result]);

  const [optimisticAccounts, updateOptimisticAccounts] = useOptimistic(
    initialAccounts,
    (state: AccountWithPendingState[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [...state, action.account];
        case "update":
          return state.map((account) =>
            account.id === action.account.id ? action.account : account,
          );
        case "delete":
          return state.filter((account) => account.id !== action.accountId);
        default:
          return state;
      }
    },
  );

  // Consolidated dialog state
  const [dialogState, setDialogState] = useState<{
    type: "add" | "edit" | "delete" | null;
    account?: AccountWithPendingState;
  }>({ type: null });

  // Optimistic action handlers
  const handleOptimisticAdd = useCallback(
    (account: AccountWithPendingState) => {
      startTransition(() => {
        updateOptimisticAccounts({ type: "add", account });
      });
    },
    [updateOptimisticAccounts],
  );

  const handleOptimisticUpdate = useCallback(
    (account: AccountWithPendingState) => {
      startTransition(() => {
        updateOptimisticAccounts({ type: "update", account });
      });
    },
    [updateOptimisticAccounts],
  );

  const handleOptimisticDelete = useCallback(
    (accountId: string) => {
      startTransition(() => {
        updateOptimisticAccounts({ type: "delete", accountId });
      });
    },
    [updateOptimisticAccounts],
  );

  // Dialog handlers
  const openAddDialog = useCallback(() => {
    setDialogState({ type: "add" });
  }, []);

  const openEditDialog = useCallback((account: AccountWithPendingState) => {
    setDialogState({ type: "edit", account });
  }, []);

  const openDeleteDialog = useCallback((account: AccountWithPendingState) => {
    setDialogState({ type: "delete", account });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({ type: null });
  }, []);

  // Memoized computed values
  const hasAccounts = useMemo(
    () => optimisticAccounts.length > 0,
    [optimisticAccounts.length],
  );

  if (!result.success)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="h-8 w-8 text-red-500 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-label="خطا"
            >
              <title>خطا</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mb-2 font-semibold text-gray-900 text-lg dark:text-gray-100">
            خطا در بارگذاری حساب‌ها
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {result.error === "Unauthorized"
              ? "شما مجاز به مشاهده این صفحه نیستید"
              : result.error || "خطای نامشخص در بارگذاری داده‌ها"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-gradient-primary-button px-6 py-2 font-medium text-white"
          >
            تلاش مجدد
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">حساب‌های مالی</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              حساب‌های مالی خود را مدیریت کنید
            </p>
          </div>
          <Dialog
            open={dialogState.type === "add"}
            onOpenChange={(open) => (open ? openAddDialog() : closeDialog())}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-gradient-primary-button px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl">
                <Plus className="mr-2 h-5 w-5" />
                افزودن حساب
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-center font-bold text-xl">
                  افزودن حساب جدید
                </DialogTitle>
              </DialogHeader>
              <AccountForm
                mode="create"
                onClose={closeDialog}
                onOptimisticAdd={handleOptimisticAdd}
              />
            </DialogContent>
          </Dialog>
        </div>

        {!hasAccounts ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                  <svg
                    className="h-8 w-8 text-primary-focus"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    role="img"
                    aria-label="افزودن حساب"
                  >
                    <title>افزودن حساب</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 text-xl dark:text-gray-100">
                  هنوز حسابی ندارید
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  با افزودن اولین حساب خود شروع کنید
                </p>
                <Button
                  onClick={openAddDialog}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3 font-medium text-white hover:from-purple-600 hover:to-blue-600"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  افزودن حساب
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {optimisticAccounts.map((account) => (
              <Card
                key={account.id}
                className={`transition-all duration-300 ${
                  account.isPending
                    ? account.pendingAction === "delete"
                      ? "scale-95 animate-pulse border-red-200 bg-red-50 opacity-50 dark:border-red-800 dark:bg-red-900/10"
                      : "animate-pulse border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10"
                    : "hover:shadow-lg"
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span
                      className={`font-bold ${account.isPending ? "opacity-70" : ""}`}
                    >
                      {account.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`py-1 ${account.isPending ? "opacity-70" : ""}`}
                      >
                        {account.type}
                      </Badge>
                      {account.isPending && (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                          <span className="text-blue-600 text-xs dark:text-blue-400">
                            {account.pendingAction === "create" &&
                              "در حال ایجاد..."}
                            {account.pendingAction === "update" &&
                              "در حال بروزرسانی..."}
                            {account.pendingAction === "delete" &&
                              "در حال حذف..."}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`space-y-4 ${account.isPending ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600 text-sm dark:text-gray-400">
                        موجودی
                      </span>
                      <span className="font-bold text-primary text-xl">
                        $
                        {account.balance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {account.bank && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground/70 text-sm">
                          بانک
                        </span>
                        <span className="font-medium text-gray-900">
                          {account.bank}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground/70 text-sm">
                        تاریخ ایجاد
                      </span>
                      <span className="text-gray-900 text-sm dark:text-gray-100">
                        {new Date(account.createdAt).toLocaleDateString(
                          "fa-IR",
                        )}
                      </span>
                    </div>
                    <div className="mt-6 flex justify-between gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => openEditDialog(account)}
                        disabled={account.isPending}
                        className={
                          account.isPending
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }
                      >
                        <Edit className="h-4 w-4" />
                        ویرایش
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => openDeleteDialog(account)}
                        disabled={account.isPending}
                        className={
                          account.isPending
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Account Dialog */}
        <Dialog
          open={dialogState.type === "edit"}
          onOpenChange={(open) => open || closeDialog()}
        >
          <DialogContent className="rounded-2xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-center font-bold text-xl">
                ویرایش حساب
              </DialogTitle>
            </DialogHeader>
            {dialogState.account && (
              <AccountForm
                mode="edit"
                initialData={dialogState.account}
                onClose={closeDialog}
                onOptimisticUpdate={handleOptimisticUpdate}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        {dialogState.type === "delete" && dialogState.account && (
          <DeleteAccountDialog
            isOpen={true}
            onClose={closeDialog}
            onSuccess={() => {}}
            onOptimisticDelete={handleOptimisticDelete}
            onOptimisticUpdate={handleOptimisticUpdate}
            account={dialogState.account}
          />
        )}
      </div>
    </div>
  );
}
