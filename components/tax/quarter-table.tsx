"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  calculate8PercentTax,
  calculateGraduatedTax,
  calculatePercentageTax,
  getQuarterDeadline,
} from "@/lib/tax";
import type { TaxEstimate } from "@/lib/types";

interface QuarterTableProps {
  quarterlyRevenue: number[];
  quarterlyExpenses: number[];
  taxEstimates: TaxEstimate[];
  taxRegime: string;
  year: number;
  userId: string;
}

export function QuarterTable({
  quarterlyRevenue,
  quarterlyExpenses,
  taxEstimates,
  taxRegime,
  year,
}: QuarterTableProps) {
  const quarters = [1, 2, 3, 4] as const;
  const labels = ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"];

  // Calculate cumulative YTD for each quarter
  const rows = quarters.map((q, i) => {
    const ytdRevenue = quarterlyRevenue.slice(0, i + 1).reduce((a, b) => a + b, 0);
    const ytdExpenses = quarterlyExpenses.slice(0, i + 1).reduce((a, b) => a + b, 0);
    const qRevenue = quarterlyRevenue[i];
    const deadline = getQuarterDeadline(year, q);
    const estimate = taxEstimates.find((e) => e.quarter === q);

    let taxDue = 0;
    if (taxRegime === "eight_percent") {
      const result = calculate8PercentTax(ytdRevenue);
      // Subtract previous quarters' tax
      const prevTax = quarters
        .slice(0, i)
        .reduce((sum, _, j) => {
          const prevYtd = quarterlyRevenue.slice(0, j + 1).reduce((a, b) => a + b, 0);
          return calculate8PercentTax(prevYtd).taxDue;
        }, 0);
      // This quarter's incremental tax
      taxDue = Math.max(0, result.taxDue - (i > 0 ? calculate8PercentTax(quarterlyRevenue.slice(0, i).reduce((a, b) => a + b, 0)).taxDue : 0));
    } else {
      const netIncome = Math.max(0, ytdRevenue - ytdExpenses);
      const graduated = calculateGraduatedTax(netIncome);
      const pctTax = calculatePercentageTax(qRevenue);
      taxDue = graduated.taxDue / (i + 1) + pctTax; // simplified per-quarter
    }

    return {
      quarter: q,
      label: labels[i],
      revenue: qRevenue,
      ytdRevenue,
      taxDue,
      deadline,
      isFiled: estimate?.is_filed ?? false,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Quarterly Breakdown — {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quarter</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">YTD Revenue</TableHead>
                <TableHead className="text-right">Est. Tax Due</TableHead>
                <TableHead className="hidden sm:table-cell">Deadline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.quarter}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.ytdRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(row.taxDue)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(row.deadline)}
                  </TableCell>
                  <TableCell>
                    {row.isFiled ? (
                      <Badge className="bg-green-100 text-green-800">
                        Filed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
