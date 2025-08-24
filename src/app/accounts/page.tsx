import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { AddAccountForm } from "@/components/add-account-form";
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

export default async function AccountsPage() {
  const result = await getAccounts();

  if (!result.success) {
    if (result.error === "Unauthorized") {
      redirect("/sign-in");
    }
    return <div>Error: {result.error}</div>;
  }

  const accounts = result.data || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your financial accounts
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <AddAccountForm />
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="font-medium text-lg">No accounts yet</h3>
              <p className="mt-2 text-muted-foreground">
                Get started by adding your first account
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{account.name}</span>
                  <span className="font-normal text-muted-foreground text-sm capitalize">
                    {account.type}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Balance
                    </span>
                    <span className="font-medium">
                      $
                      {account.balance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {account.bank && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Bank
                      </span>
                      <span className="text-sm">{account.bank}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Created
                    </span>
                    <span className="text-sm">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
