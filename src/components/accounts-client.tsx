"use client";

import { Building2, CreditCard, Edit, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
import { ACCOUNT_TYPE_LABELS } from "@/lib/types/accounts";
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
    <div>
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
              <Button>
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <motion.div
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4, type: "spring" }}
                  >
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
                  </motion.div>
                  <motion.h3
                    className="mb-2 font-semibold text-gray-900 text-xl dark:text-gray-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    هنوز حسابی ندارید
                  </motion.h3>
                  <motion.p
                    className="mb-6 text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    با افزودن اولین حساب خود شروع کنید
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <Button
                      onClick={openAddDialog}
                      className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3 font-medium text-white hover:from-purple-600 hover:to-blue-600"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      افزودن حساب
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              layout
            >
              {optimisticAccounts.map((account) => (
                <motion.div
                  key={account.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{
                    opacity:
                      account.isPending && account.pendingAction === "delete"
                        ? 0.5
                        : 1,
                    y: 0,
                    scale:
                      account.isPending && account.pendingAction === "delete"
                        ? 0.95
                        : 1,
                  }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    layout: { duration: 0.3 },
                  }}
                  className={`group ${
                    account.isPending && account.pendingAction === "delete"
                      ? "pointer-events-none"
                      : ""
                  }`}
                >
                  <Card
                    className={`overflow-hidden border-0 bg-white/70 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white/90 hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800/90 ${
                      account.isPending && account.pendingAction !== "delete"
                        ? "ring-2 ring-blue-200 dark:ring-blue-700"
                        : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                            <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <span
                              className={`font-bold text-lg ${account.isPending ? "opacity-70" : ""}`}
                            >
                              {account.name}
                            </span>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`py-0.5 text-xs ${account.isPending ? "opacity-70" : ""}`}
                              >
                                {ACCOUNT_TYPE_LABELS.find(
                                  (t) => t.value === account.type,
                                )?.label || account.type}
                              </Badge>
                              {account.isPending && (
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"></div>
                                  <span className="text-blue-600 text-xs dark:text-blue-400">
                                    {account.pendingAction === "create" &&
                                      "ایجاد..."}
                                    {account.pendingAction === "update" &&
                                      "بروزرسانی..."}
                                    {account.pendingAction === "delete" &&
                                      "حذف..."}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div
                        className={`space-y-4 ${account.isPending ? "opacity-70" : ""}`}
                      >
                        <div className="rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4 dark:from-gray-700 dark:to-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-600 text-sm dark:text-gray-300">
                              موجودی فعلی
                            </span>
                            <span className="font-bold text-2xl text-primary">
                              $
                              {account.balance.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>

                        {account.bank && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {account.bank}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-500 text-sm dark:text-gray-400">
                          <span>ایجاد شده در:</span>
                          <span>
                            {new Date(account.createdAt).toLocaleDateString(
                              "fa-IR",
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2 pt-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(account)}
                            disabled={account.isPending}
                            className="flex-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            ویرایش
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(account)}
                            disabled={account.isPending}
                            className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
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
