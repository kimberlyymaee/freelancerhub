"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import type { ImportConfig, ImportResult } from "@/lib/import/types";

interface ResultStepProps {
  result: ImportResult;
  config: ImportConfig;
  onClose: () => void;
}

export function ResultStep({ result, config, onClose }: ResultStepProps) {
  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        {result.errorCount === 0 ? (
          <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-3" />
        ) : (
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-600 mb-3" />
        )}
        <h3 className="text-lg font-semibold">
          {result.successCount} of {result.totalRows}{" "}
          {config.entityLabel.toLowerCase()} imported
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div className="rounded-md border p-3">
          <p className="text-2xl font-bold text-green-600">
            {result.successCount}
          </p>
          <p className="text-muted-foreground">Imported</p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-2xl font-bold text-destructive">
            {result.errorCount}
          </p>
          <p className="text-muted-foreground">Skipped</p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-2xl font-bold">{result.totalRows}</p>
          <p className="text-muted-foreground">Total</p>
        </div>
      </div>

      {result.skippedRows.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-destructive">
            View {result.skippedRows.length} skipped row(s)
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground max-h-[200px] overflow-y-auto">
            {result.skippedRows.map((r, i) => (
              <li key={i}>
                <span className="font-medium">Row {r.rowIndex}:</span>{" "}
                {r.errors.join("; ")}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
