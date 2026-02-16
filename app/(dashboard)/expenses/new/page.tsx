import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ExpenseForm } from "@/components/expenses/expense-form";

export default async function NewExpensePage() {
  const session = await auth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session!.user.id)
    .single();

  const { data: categories } = await supabase
    .from("expense_categories")
    .select("name")
    .eq("user_id", session!.user.id)
    .order("name");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .in("status", ["not_started", "in_progress"])
    .order("name");

  return (
    <>
      <Header
        title="New Expense"
        userName={profile?.full_name}
        userEmail={session?.user?.email}
      />
      <div className="p-4 md:p-6 max-w-2xl">
        <ExpenseForm
          userId={session!.user.id}
          categories={categories?.map((c) => c.name) ?? []}
          projects={projects ?? []}
        />
      </div>
    </>
  );
}
