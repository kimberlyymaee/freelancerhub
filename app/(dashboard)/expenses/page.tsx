import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { NewExpenseDialog } from "@/components/expenses/new-expense-dialog";

export default async function ExpensesPage() {
  const session = await auth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session!.user.id)
    .single();

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  const { data: categories } = await supabase
    .from("expense_categories")
    .select("name")
    .eq("user_id", session!.user.id);

  return (
    <>
      <Header title="Expenses" userName={profile?.full_name} userEmail={session?.user?.email}>
        <NewExpenseDialog userId={session!.user.id} />
      </Header>
      <div className="p-4 md:p-6">
        <ExpenseTable
          expenses={expenses ?? []}
          categories={categories?.map((c) => c.name) ?? []}
        />
      </div>
    </>
  );
}
