import type { ImportConfig } from "./types";

function generateTemplate(config: ImportConfig): string {
  const headers = config.columns.map((col) => col.label);
  const exampleRow = config.columns.map((col) => {
    if (col.enumValues) return col.enumValues[0];
    if (col.type === "date") return "2025-01-15";
    if (col.type === "number") return "0";
    if (col.type === "boolean") return "true";
    if (col.type === "fk_lookup") return "";
    return "";
  });

  return [headers.join(","), exampleRow.join(",")].join("\n");
}

export function downloadTemplate(config: ImportConfig): void {
  const csvContent = generateTemplate(config);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = config.templateFileName;
  link.click();
  URL.revokeObjectURL(url);
}
