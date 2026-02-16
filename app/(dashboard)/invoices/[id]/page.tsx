import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { InvoiceDetail } from "@/components/invoices/invoice-detail";
import { notFound } from "next/navigation";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const supabase = createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "*, client:clients(company_name, email, address, contact_name), items:invoice_items(*), payments:payments(*)"
    )
    .eq("id", id)
    .single();

  if (!invoice) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session!.user.id)
    .single();

  return (
    <>
      <Header
        title={`Invoice ${invoice.invoice_number}`}
        userName={profile?.full_name}
        userEmail={session?.user?.email}
      />
      <div className="p-4 md:p-6">
        <InvoiceDetail
          invoice={invoice}
          profile={profile}
          userId={session!.user.id}
        />
      </div>
    </>
  );
}
