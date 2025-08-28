import { AccountsClient } from "@/components/accounts-client";
import { getAccounts } from "@/lib/actions/accounts";

export default async function AccountsPage() {
  const accountsPromise = getAccounts();

  return <AccountsClient accountsPromise={accountsPromise} />;
}
