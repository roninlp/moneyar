"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import { getAccounts } from "@/lib/actions/accounts";
import type { Account } from "@/lib/types/accounts";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const result = await getAccounts();
      if (result.success) {
        setAccounts(result.data || []);
      } else {
        setError(result.error || "Failed to fetch accounts");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-purple-500 border-b-2"></div>
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-red-500">⚠️</div>
          <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
            خطا
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
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
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                onClose={() => {
                  setShowAddDialog(false);
                  fetchAccounts();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {accounts.length === 0 ? (
          <Card className="rounded-2xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
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
                  onClick={() => setShowAddDialog(true)}
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
            {accounts.map((account) => (
              <Card
                key={account.id}
                className="rounded-2xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-xl dark:bg-gray-800/80"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-lg dark:text-gray-100">
                      {account.name}
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-1 font-medium text-purple-700 text-xs capitalize dark:from-purple-900/20 dark:to-blue-900/20 dark:text-purple-300">
                      {account.type}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600 text-sm dark:text-gray-400">
                        موجودی
                      </span>
                      <span className="font-bold text-green-600 text-xl">
                        $
                        {account.balance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {account.bank && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600 text-sm dark:text-gray-400">
                          بانک
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {account.bank}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600 text-sm dark:text-gray-400">
                        تاریخ ایجاد
                      </span>
                      <span className="text-gray-900 text-sm dark:text-gray-100">
                        {new Date(account.createdAt).toLocaleDateString(
                          "fa-IR",
                        )}
                      </span>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditAccount(account)}
                        className="flex-1 rounded-xl border-purple-200 text-purple-700 hover:border-purple-300 hover:bg-purple-50"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        ویرایش
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteAccount(account)}
                        className="flex-1 rounded-xl border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Account Dialog */}
        <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
          <DialogContent className="rounded-2xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-center font-bold text-xl">
                ویرایش حساب
              </DialogTitle>
            </DialogHeader>
            {editAccount && (
              <AccountForm
                mode="edit"
                initialData={editAccount}
                onClose={() => {
                  setEditAccount(null);
                  fetchAccounts();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        {deleteAccount && (
          <DeleteAccountDialog
            isOpen={!!deleteAccount}
            onClose={() => setDeleteAccount(null)}
            onSuccess={fetchAccounts}
            account={deleteAccount}
          />
        )}
      </div>
    </div>
  );
}
