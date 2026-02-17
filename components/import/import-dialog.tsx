"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { parseFile } from "@/lib/import/parsers";
import { buildColumnMapping, validateRows } from "@/lib/import/validators";
import { downloadTemplate } from "@/lib/import/templates";
import { getPayloadBuilder } from "@/lib/import/payload-builders";
import { FileUploadStep } from "./file-upload-step";
import { PreviewStep } from "./preview-step";
import { ResultStep } from "./result-step";
import type {
  ImportConfig,
  ImportRow,
  ImportResult,
  ImportStep,
  FkDataEntry,
} from "@/lib/import/types";

interface ImportDialogProps {
  config: ImportConfig;
  userId: string;
  fkData?: FkDataEntry[];
}

export function ImportDialog({ config, userId, fkData }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>("upload");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const router = useRouter();

  const fkLookups = useMemo(() => {
    const map = new Map<string, Map<string, string>>();
    for (const fk of fkData ?? []) {
      map.set(
        fk.tableName,
        new Map(fk.entries.map((e) => [e.display, e.id]))
      );
    }
    return map;
  }, [fkData]);

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setStep("upload");
      setRows([]);
      setResult(null);
    }, 300);
  }

  async function handleFileSelect(file: File) {
    try {
      const parsed = await parseFile(file);
      const mapping = buildColumnMapping(parsed.headers, config.columns);

      const requiredCols = config.columns.filter((c) => c.required);
      const unmappedRequired = requiredCols.filter(
        (c) => ![...mapping.values()].includes(c.key)
      );
      if (unmappedRequired.length > 0) {
        toast.error(
          `Missing required columns: ${unmappedRequired.map((c) => c.label).join(", ")}`
        );
        return;
      }

      const validated = validateRows(parsed.rows, config, mapping, fkLookups);
      setRows(validated);
      setStep("preview");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to parse file"
      );
    }
  }

  async function handleImport() {
    setImporting(true);
    setStep("importing");
    const supabase = createClient();

    const validRows = rows.filter((r) => r.isValid);
    const buildPayload = getPayloadBuilder(config.entityName);
    const payloads = validRows.map((r) => buildPayload(r.data, userId));

    const BATCH_SIZE = 100;
    let successCount = 0;
    const failedInBatch: { rowIndex: number; errors: string[] }[] = [];

    for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
      const batch = payloads.slice(i, i + BATCH_SIZE);
      const batchRows = validRows.slice(i, i + BATCH_SIZE);

      const { error } = await supabase.from(config.tableName).insert(batch);

      if (error) {
        for (let j = 0; j < batch.length; j++) {
          const { error: singleError } = await supabase
            .from(config.tableName)
            .insert(batch[j]);
          if (singleError) {
            failedInBatch.push({
              rowIndex: batchRows[j].rowIndex,
              errors: [singleError.message],
            });
          } else {
            successCount++;
          }
        }
      } else {
        successCount += batch.length;
      }
    }

    const importResult: ImportResult = {
      totalRows: rows.length,
      successCount,
      errorCount:
        rows.filter((r) => !r.isValid).length + failedInBatch.length,
      skippedRows: [
        ...rows
          .filter((r) => !r.isValid)
          .map((r) => ({ rowIndex: r.rowIndex, errors: r.errors })),
        ...failedInBatch,
      ],
    };

    setResult(importResult);
    setStep("results");
    setImporting(false);

    if (successCount > 0) {
      toast.success(
        `Imported ${successCount} ${config.entityLabel.toLowerCase()}`
      );
      router.refresh();
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Import
      </Button>
      <Dialog
        open={open}
        onOpenChange={(val) => (val ? setOpen(true) : handleClose())}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import {config.entityLabel}</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to bulk import{" "}
              {config.entityLabel.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          {step === "upload" && (
            <FileUploadStep
              config={config}
              onFileSelect={handleFileSelect}
              onDownloadTemplate={() => downloadTemplate(config)}
            />
          )}

          {step === "preview" && (
            <PreviewStep
              config={config}
              rows={rows}
              onBack={() => setStep("upload")}
              onImport={handleImport}
            />
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Importing {config.entityLabel.toLowerCase()}...
              </p>
            </div>
          )}

          {step === "results" && result && (
            <ResultStep
              result={result}
              config={config}
              onClose={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
