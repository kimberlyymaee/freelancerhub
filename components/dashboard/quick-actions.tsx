"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, Receipt, Clock, ArrowRight } from "lucide-react";
import { NewClientDialog } from "@/components/clients/new-client-dialog";
import { NewInvoiceDialog } from "@/components/invoices/new-invoice-dialog";
import { NewExpenseDialog } from "@/components/expenses/new-expense-dialog";

interface QuickActionsProps {
  userId: string;
}

function ActionCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group cursor-pointer">
      <Card className="gap-0 overflow-hidden py-0 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-muted p-2 group-hover:scale-110 transition-transform duration-200">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{title}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {description}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
        </CardContent>
      </Card>
    </div>
  );
}

export function QuickActions({ userId }: QuickActionsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NewClientDialog
        userId={userId}
        trigger={
          <ActionCard
            icon={Users}
            title="Add Client"
            description="New client profile"
          />
        }
      />

      <NewInvoiceDialog
        userId={userId}
        trigger={
          <ActionCard
            icon={Plus}
            title="New Invoice"
            description="Bill a client"
          />
        }
      />

      <NewExpenseDialog
        userId={userId}
        trigger={
          <ActionCard
            icon={Receipt}
            title="Log Expense"
            description="Track a purchase"
          />
        }
      />

      <Link href="/time" className="group">
        <Card className="gap-0 overflow-hidden py-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-muted p-2 group-hover:scale-110 transition-transform duration-200">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Log Time</p>
                <p className="text-xs text-muted-foreground leading-tight">
                  Track your hours
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
