import { Header } from "@/components/layout/header";
import { ClientForm } from "@/components/clients/client-form";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function NewClientPage() {
  const session = await auth();
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session!.user.id)
    .single();

  return (
    <>
      <Header title="New Client" userName={profile?.full_name} userEmail={session?.user?.email} />
      <div className="p-4 md:p-6 max-w-2xl">
        <ClientForm userId={session!.user.id} />
      </div>
    </>
  );
}
