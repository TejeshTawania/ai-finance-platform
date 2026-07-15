import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "./_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export const dynamic = "force-dynamic";

export default async function CreateTransactionPage({ searchParams }) {
  const accounts = await getUserAccounts();
  const { edit } = await searchParams;

  let initialData = null;
  if (edit) {
    initialData = await getTransaction(edit);
  }

  return (
    <div className="max-w-3xl mx-auto px-5 min-h-screen pb-20">
      <h1 className="text-5xl font-bold gradient-title mb-8">
        {edit ? "Edit Transaction" : "Add Transaction"}
      </h1>

      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!edit}
        initialData={initialData}
      />
    </div>
  );
}
