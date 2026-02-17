"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImportConfig } from "@/lib/import/types";

interface FileUploadStepProps {
  config: ImportConfig;
  onFileSelect: (file: File) => void;
  onDownloadTemplate: () => void;
}

export function FileUploadStep({
  config,
  onFileSelect,
  onDownloadTemplate,
}: FileUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        )}
      >
        <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop a CSV or Excel file here, or
        </p>
        <label>
          <Button variant="secondary" size="sm" asChild>
            <span>Browse Files</span>
          </Button>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
        <p className="text-xs text-muted-foreground mt-2">
          Supports .csv and .xlsx files
        </p>
      </div>

      <div className="flex items-center justify-between rounded-md border p-3 bg-muted/50">
        <div>
          <p className="text-sm font-medium">Need a template?</p>
          <p className="text-xs text-muted-foreground">
            Download a CSV template with the expected column headers
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Template
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Expected columns:</p>
        <p>
          {config.columns.map((col, i) => (
            <span key={col.key}>
              {col.label}
              {col.required && (
                <span className="text-destructive">*</span>
              )}
              {i < config.columns.length - 1 && ", "}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
