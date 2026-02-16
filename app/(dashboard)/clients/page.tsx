import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ClientTable } from "@/components/clients/client-table";
import { NewClientDialog } from "@/components/clients/new-client-dialog";

export default async function ClientsPage() {
  const session = await auth();
  const supabase = createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session!.user.id)
    .single();

  return (
    <>
      <Header title="Clients" userName={profile?.full_name} userEmail={session?.user?.email}>
        <NewClientDialog userId={session!.user.id} />
      </Header>
      <div className="p-4 md:p-6">
        <ClientTable clients={clients ?? []} />
      </div>
    </>
  );
}
