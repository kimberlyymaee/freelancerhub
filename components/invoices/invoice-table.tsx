"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import type { Invoice } from "@/lib/types";

interface InvoiceTableProps {
  invoices: (Invoice & {
    client?: { company_name: string } | null;
  })[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Auto-detect overdue
  const today = new Date().toISOString().split("T")[0];
  const processedInvoices = invoices.map((inv) => {
    if (
      inv.due_date &&
      inv.due_date < today &&
      !["paid", "cancelled"].includes(inv.status)
    ) {
      return { ...inv, displayStatus: "overdue" as const };
    }
    return { ...inv, displayStatus: inv.status };
  });

  const filtered = processedInvoices.filter(
    (inv) =>
      statusFilter === "all" || inv.displayStatus === statusFilter
  );

  function formatStatus(status: string): string {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  return (
    <div className="space-y-4">
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {invoices.length === 0
              ? "No invoices yet. Create your first invoice!"
              : "No invoices match this filter."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead className="hidden sm:table-cell">Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="hidden md:table-cell">Due</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                >
                  <TableCell className="font-medium">
                    {inv.invoice_number}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {inv.client?.company_name ?? "-"}
                  </TableCell>
                  <TableCell>{formatDate(inv.issue_date)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {inv.due_date ? formatDate(inv.due_date) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(inv.total)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        STATUS_COLORS[inv.displayStatus] || ""
                      }
                    >
                      {formatStatus(inv.displayStatus)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
