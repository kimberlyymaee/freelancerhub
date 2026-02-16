"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { InvoiceBuilder } from "./invoice-builder";
import type { Profile } from "@/lib/types";

interface NewInvoiceDialogProps {
  userId: string;
  trigger?: React.ReactNode;
}

export function NewInvoiceDialog({ userId, trigger }: NewInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clients, setClients] = useState<
    { id: string; company_name: string; email: string | null; address: string | null }[]
  >([]);
  const [projects, setProjects] = useState<
    { id: string; name: string; rate: number | null; client_id: string | null }[]
  >([]);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setLoaded(false);
      return;
    }
    const supabase = createClient();

    Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("clients")
        .select("id, company_name, email, address")
        .eq("status", "active")
        .order("company_name"),
      supabase
        .from("projects")
        .select("id, name, rate, client_id")
        .in("status", ["not_started", "in_progress"])
        .order("name"),
      supabase
        .from("invoices")
        .select("invoice_number")
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]).then(([profRes, clientRes, projRes, lastInvRes]) => {
      setProfile(profRes.data);
      setClients(clientRes.data ?? []);
      setProjects(projRes.data ?? []);
      setLastInvoiceNumber(lastInvRes.data?.invoice_number ?? null);
      setLoaded(true);
    });
  }, [open, userId]);

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      )}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a client.
          </DialogDescription>
        </DialogHeader>
        {loaded ? (
          <InvoiceBuilder
            userId={userId}
            profile={profile}
            clients={clients}
            projects={projects}
            lastInvoiceNumber={lastInvoiceNumber}
            variant="modal"
            onSuccess={handleSuccess}
          />
        ) : (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
