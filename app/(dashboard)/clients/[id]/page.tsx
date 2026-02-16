import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ClientDetail } from "@/components/clients/client-detail";
import { notFound } from "next/navigation";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const supabase = createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session!.user.id)
    .single();

  // Fetch associated projects and invoices
  const [{ data: projects }, { data: invoices }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("*")
      .eq("client_id", id)
      .order("issue_date", { ascending: false }),
  ]);

  return (
    <>
      <Header
        title={client.company_name}
        userName={profile?.full_name}
        userEmail={session?.user?.email}
      />
      <div className="p-4 md:p-6">
        <ClientDetail
          client={client}
          projects={projects ?? []}
          invoices={invoices ?? []}
          userId={session!.user.id}
        />
      </div>
    </>
  );
}
