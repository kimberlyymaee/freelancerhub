"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { VatThresholdStatus } from "@/lib/types";

interface ThresholdBarProps {
  status: VatThresholdStatus;
}

export function ThresholdBar({ status }: ThresholdBarProps) {
  const colorClass =
    status.level === "danger"
      ? "bg-red-500"
      : status.level === "warning"
        ? "bg-yellow-500"
        : "bg-green-500";

  const textClass =
    status.level === "danger"
      ? "text-red-600"
      : status.level === "warning"
        ? "text-yellow-600"
        : "text-green-600";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>VAT Threshold Tracker</span>
          <span className={`text-sm font-medium ${textClass}`}>
            {status.percentage.toFixed(1)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${colorClass}`}
            style={{ width: `${Math.min(100, status.percentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(status.currentRevenue)}</span>
          <span>{formatCurrency(status.threshold)}</span>
        </div>
        {status.level === "warning" && (
          <p className="text-sm text-yellow-600 font-medium">
            Warning: You are approaching the VAT threshold. Consider your registration options.
          </p>
        )}
        {status.level === "danger" && (
          <p className="text-sm text-red-600 font-medium">
            Alert: You are at or near the VAT threshold. The 8% rate option may no longer be available. Consult your tax advisor.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
