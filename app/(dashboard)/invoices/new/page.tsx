import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { InvoiceBuilder } from "@/components/invoices/invoice-builder";

export default async function NewInvoicePage() {
  const session = await auth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session!.user.id)
    .single();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, company_name, email, address")
    .eq("status", "active")
    .order("company_name");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, rate, client_id")
    .in("status", ["not_started", "in_progress"])
    .order("name");

  // Get the last invoice number
  const { data: lastInvoice } = await supabase
    .from("invoices")
    .select("invoice_number")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <>
      <Header
        title="New Invoice"
        userName={profile?.full_name}
        userEmail={session?.user?.email}
      />
      <div className="p-4 md:p-6">
        <InvoiceBuilder
          userId={session!.user.id}
          profile={profile}
          clients={clients ?? []}
          projects={projects ?? []}
          lastInvoiceNumber={lastInvoice?.invoice_number ?? null}
        />
      </div>
    </>
  );
}
