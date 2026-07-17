import React from "react";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getUserAccounts } from "@/actions/dashboard";
import AccountCard from "./_components/account-card";
import { getCurrentBudget } from "@/actions/budget";
import { BudgetProgress } from "./_components/budget-progress";
import { getUserTransactions } from "@/actions/transaction";
import { DashboardOverview } from "./_components/transaction-overview";

async function DashboardPage() {
  const accounts = await getUserAccounts();

  const defaultAccount = accounts?.find((account) => account.isDefault);
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  const transactions = await getUserTransactions();

  return (
    <div className="px-5">
      <h1 className="text-6xl font-bold gradient-title mb-5"> Dashboard</h1>
      
      {/* Budget progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* Overview */}
      {accounts?.length > 0 && (
        <DashboardOverview
          accounts={accounts}
          transactions={transactions?.data || []}
        />
      )}

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
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
