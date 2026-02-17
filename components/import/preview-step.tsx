"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import type { ImportConfig, ImportRow } from "@/lib/import/types";

interface PreviewStepProps {
  config: ImportConfig;
  rows: ImportRow[];
  onBack: () => void;
  onImport: () => void;
}

export function PreviewStep({
  config,
  rows,
  onBack,
  onImport,
}: PreviewStepProps) {
  const validCount = rows.filter((r) => r.isValid).length;
  const errorCount = rows.filter((r) => !r.isValid).length;
  const previewColumns = config.columns.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-green-600" />
          {validCount} valid
        </span>
        {errorCount > 0 && (
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {errorCount} with errors (will be skipped)
          </span>
        )}
        <span className="text-muted-foreground">{rows.length} total rows</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
              {previewColumns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.rowIndex}
                className={row.isValid ? "" : "bg-destructive/5"}
              >
                <TableCell className="text-muted-foreground text-xs">
                  {row.rowIndex}
                </TableCell>
                <TableCell>
                  {row.isValid ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Valid
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      title={row.errors.join("; ")}
                    >
                      Error
                    </Badge>
                  )}
                </TableCell>
                {previewColumns.map((col) => (
                  <TableCell
                    key={col.key}
                    className="max-w-[200px] truncate"
                  >
                    {String(row.data[col.key] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {errorCount > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-destructive font-medium">
            View {errorCount} error(s)
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {rows
              .filter((r) => !r.isValid)
              .map((r) => (
                <li key={r.rowIndex}>
                  <span className="font-medium">Row {r.rowIndex}:</span>{" "}
                  {r.errors.join("; ")}
                </li>
              ))}
          </ul>
        </details>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="sm" onClick={onImport} disabled={validCount === 0}>
          Import {validCount}{" "}
          {validCount === 1
            ? config.entityLabelSingular
            : config.entityLabel}
        </Button>
      </div>
    </div>
  );
}
