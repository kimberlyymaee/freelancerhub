import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ProfileForm } from "@/components/settings/profile-form";
import { ExpenseCategories } from "@/components/settings/expense-categories";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const session = await auth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session!.user.id)
    .single();

  const { data: categories } = await supabase
    .from("expense_categories")
    .select("*")
    .eq("user_id", session!.user.id)
    .order("name");

  return (
    <>
      <Header title="Settings" userName={profile?.full_name} userEmail={session?.user?.email} />
      <div className="p-4 md:p-6 max-w-3xl space-y-8">
        <ProfileForm profile={profile} userId={session!.user.id} />
        <Separator />
        <ExpenseCategories
          categories={categories ?? []}
          userId={session!.user.id}
        />
      </div>
    </>
  );
}
