"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { TaxComparison as TaxComparisonType } from "@/lib/types";
import { RotateCcw } from "lucide-react";

interface TaxComparisonProps {
  comparison: TaxComparisonType;
  simRevenue: number;
  simExpenses: number;
  onRevenueChange: (val: number) => void;
  onExpensesChange: (val: number) => void;
  actualRevenue: number;
  actualExpenses: number;
}

export function TaxComparison({
  comparison,
  simRevenue,
  simExpenses,
  onRevenueChange,
  onExpensesChange,
  actualRevenue,
  actualExpenses,
}: TaxComparisonProps) {
  const isSimulating =
    simRevenue !== actualRevenue || simExpenses !== actualExpenses;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          8% vs Graduated Comparison
          {isSimulating && (
            <Badge variant="outline" className="ml-2">
              What-if mode
            </Badge>
          )}
        </CardTitle>
        {isSimulating && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onRevenueChange(actualRevenue);
              onExpensesChange(actualExpenses);
            }}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* What-if inputs */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Gross Revenue</Label>
            <Input
              type="number"
              value={simRevenue || ""}
              onChange={(e) => onRevenueChange(Number(e.target.value) || 0)}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Expenses</Label>
            <Input
              type="number"
              value={simExpenses || ""}
              onChange={(e) => onExpensesChange(Number(e.target.value) || 0)}
              className="h-8"
            />
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* 8% Regime */}
          <div
            className={`rounded-lg border-2 p-4 ${
              comparison.recommendation === "eight_percent"
                ? "border-green-500 bg-green-50"
                : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">8% Flat Rate</h3>
              {comparison.recommendation === "eight_percent" && (
                <Badge className="bg-green-600">Recommended</Badge>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Revenue</span>
                <span>{formatCurrency(comparison.grossRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exemption</span>
                <span>- {formatCurrency(comparison.exemption8Pct)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxable Amount</span>
                <span>{formatCurrency(comparison.taxableAmount8Pct)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Income Tax (8%)</span>
                <span>{formatCurrency(comparison.taxDue8Pct)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Percentage Tax</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total Tax</span>
                <span>{formatCurrency(comparison.totalTax8Pct)}</span>
              </div>
            </div>
          </div>

          {/* Graduated Regime */}
          <div
            className={`rounded-lg border-2 p-4 ${
              comparison.recommendation === "graduated"
                ? "border-green-500 bg-green-50"
                : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Graduated Rates</h3>
              {comparison.recommendation === "graduated" && (
                <Badge className="bg-green-600">Recommended</Badge>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Revenue</span>
                <span>{formatCurrency(comparison.grossRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expenses Deducted</span>
                <span>- {formatCurrency(comparison.totalExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxable Income</span>
                <span>
                  {formatCurrency(comparison.taxableAmountGraduated)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Income Tax</span>
                <span>{formatCurrency(comparison.incomeTaxGraduated)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Percentage Tax (3%)
                </span>
                <span>
                  {formatCurrency(comparison.percentageTaxGraduated)}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total Tax</span>
                <span>{formatCurrency(comparison.totalTaxGraduated)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings callout */}
        {comparison.savings > 0 && (
          <div className="rounded-md bg-muted p-3 text-center">
            <p className="text-sm">
              You save{" "}
              <strong className="text-green-600">
                {formatCurrency(comparison.savings)}
              </strong>{" "}
              with the{" "}
              <strong>
                {comparison.recommendation === "eight_percent"
                  ? "8% Flat Rate"
                  : "Graduated Rate"}
              </strong>{" "}
              regime.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
