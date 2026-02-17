export interface ImportColumn {
  key: string;
  label: string;
  required: boolean;
  type: "string" | "number" | "date" | "boolean" | "enum" | "fk_lookup";
  enumValues?: string[];
  fkTable?: string;
  fkDisplayField?: string;
  fkIdField?: string;
  aliases?: string[];
  defaultValue?: unknown;
}

export interface ImportConfig {
  entityName: string;
  entityLabel: string;
  entityLabelSingular: string;
  tableName: string;
  columns: ImportColumn[];
  templateFileName: string;
}

export type BuildPayloadFn = (
  row: Record<string, unknown>,
  userId: string
) => Record<string, unknown>;

export interface ImportRow {
  rowIndex: number;
  data: Record<string, unknown>;
  errors: string[];
  isValid: boolean;
}

export type ImportStep = "upload" | "preview" | "importing" | "results";

export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedRows: { rowIndex: number; errors: string[] }[];
}

export interface FkDataEntry {
  tableName: string;
  entries: { display: string; id: string }[];
}
