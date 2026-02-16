"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { compareTaxRegimes, getVatThresholdStatus } from "@/lib/tax";
import { TaxComparison } from "./tax-comparison";
import { ThresholdBar } from "./threshold-bar";
import { QuarterTable } from "./quarter-table";
import { FILING_DEADLINES } from "@/lib/constants";
import type { TaxEstimate } from "@/lib/types";

interface TaxPageProps {
  grossRevenue: number;
  totalExpenses: number;
  quarterlyRevenue: number[];
  quarterlyExpenses: number[];
  taxEstimates: TaxEstimate[];
  taxRegime: string;
  year: number;
  userId: string;
}

export function TaxPage({
  grossRevenue,
  totalExpenses,
  quarterlyRevenue,
  quarterlyExpenses,
  taxEstimates,
  taxRegime,
  year,
  userId,
}: TaxPageProps) {
  const [simRevenue, setSimRevenue] = useState(grossRevenue);
  const [simExpenses, setSimExpenses] = useState(totalExpenses);

  const comparison = compareTaxRegimes(simRevenue, simExpenses);
  const vatStatus = getVatThresholdStatus(grossRevenue);

  // Upcoming deadlines
  const now = new Date();
  const upcomingDeadlines = FILING_DEADLINES.map((d) => {
    const deadlineYear = d.quarter === 4 ? year + 1 : year;
    const deadline = new Date(deadlineYear, d.month - 1, d.day);
    const isPast = deadline < now;
    const filed = taxEstimates.find((e) => e.quarter === d.quarter)?.is_filed ?? false;
    return { ...d, deadline, isPast, filed };
  });

  return (
    <div className="space-y-6">
      {/* YTD Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Gross Revenue YTD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(grossRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses YTD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Regime</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-base">
              {taxRegime === "eight_percent" ? "8% Flat Rate" : "Graduated"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* VAT Threshold */}
      <ThresholdBar status={vatStatus} />

      {/* Tax Comparison */}
      <TaxComparison
        comparison={comparison}
        simRevenue={simRevenue}
        simExpenses={simExpenses}
        onRevenueChange={setSimRevenue}
        onExpensesChange={setSimExpenses}
        actualRevenue={grossRevenue}
        actualExpenses={totalExpenses}
      />

      {/* Quarterly Breakdown */}
      <QuarterTable
        quarterlyRevenue={quarterlyRevenue}
        quarterlyExpenses={quarterlyExpenses}
        taxEstimates={taxEstimates}
        taxRegime={taxRegime}
        year={year}
        userId={userId}
      />

      {/* Filing Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filing Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDeadlines.map((d) => (
              <div
                key={d.quarter}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{d.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Form {d.form} — Due{" "}
                    {d.deadline.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  {d.filed ? (
                    <Badge className="bg-green-100 text-green-800">Filed</Badge>
                  ) : d.isPast ? (
                    <Badge variant="destructive">Overdue</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
