import React from "react";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getUserAccounts } from "@/actions/dashboard";
import AccountCard from "./_components/account-card";

async function DashboardPage() {
  const accounts = await getUserAccounts();

  return (
    <div className="px-5">
      <h1 className="text-6xl font-bold gradient-title mb-5"> Dashboard</h1>
      {/* Budget progress */}

      {/* Overview */}

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          {/* Wrap the card in a single block level element to allow proper slotting 👇 */}
          <div className="w-full h-full">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
              <CardContent
                className="p-3 flex flex-col items-center justify-center gap-3
        text-muted-foreground h-full pt-5"
              >
                <Plus className="h-10 w-10" />
                <p className="text-lg font-medium">Create new Account</p>
              </CardContent>
            </Card>
          </div>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts?.map((account) => {
            return <AccountCard key={account.id} account={account} />;
          })}
      </div>
    </div>
  );
}

export default DashboardPage;
